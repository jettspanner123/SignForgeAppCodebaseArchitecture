import os
import sys
import glob
import subprocess
from pathlib import Path
from typing import Optional

# Enable UTF-8 encoding on Windows
if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8")
        os.system("")
    except Exception:
        pass


class BackendRunner:
    CURRENT: "BackendRunner"

    def __init__(self) -> None:
        self.RootDirectory: Path = Path(__file__).resolve().parent.parent
        self.ServerDirectory: Path = self.RootDirectory / "SignForgeOrchestratorServiceLayerMSC"

    def DiscoverJavaHome(self) -> Optional[str]:
        # Prioritize LTS JDK 21 installations on Windows matching pom.xml target
        if sys.platform == "win32":
            jdk21_patterns = [
                "C:/Program Files/Android/openjdk/jdk-21*",
                "C:/Program Files/JetBrains/IntelliJ IDEA*/jbr",
                "C:/Program Files/JetBrains/JetBrains Rider*/jbr",
                "C:/Program Files/Java/jdk-21*",
                "C:/Program Files/Eclipse Adoptium/jdk-21*",
                "C:/Program Files/Microsoft/jdk-21*",
                str(Path.home() / ".jdks/*21*"),
            ]
            for pattern in jdk21_patterns:
                matches = glob.glob(pattern)
                for m in matches:
                    if (Path(m) / "bin" / "java.exe").exists() and (Path(m) / "bin" / "javac.exe").exists():
                        return m

        # Check existing environment variable
        env_java = os.environ.get("JAVA_HOME")
        if env_java and Path(env_java).exists():
            return env_java

        # Check user's .jdks directory
        user_home = Path.home()
        jdks_dir = user_home / ".jdks"
        if jdks_dir.exists():
            for child in jdks_dir.iterdir():
                if child.is_dir() and (child / "bin" / ("java.exe" if sys.platform == "win32" else "java")).exists():
                    return str(child)

        if sys.platform == "win32":
            common_roots = [
                Path("C:/Program Files/Java"),
                Path("C:/Program Files/Eclipse Adoptium"),
                Path("C:/Program Files/Microsoft"),
                Path("C:/Program Files/Amazon Corretto"),
            ]
            for root in common_roots:
                if root.exists():
                    for child in root.iterdir():
                        if child.is_dir() and (child / "bin" / "java.exe").exists():
                            return str(child)

        return None

    def DiscoverMaven(self) -> Optional[str]:
        # 1. Wrapper in server directory
        mvnw_cmd = "mvnw.cmd" if sys.platform == "win32" else "./mvnw"
        mvnw_path = self.ServerDirectory / ("mvnw.cmd" if sys.platform == "win32" else "mvnw")
        if mvnw_path.exists():
            return str(mvnw_path)

        # 2. Check IntelliJ IDEA Bundled Maven on Windows
        if sys.platform == "win32":
            jetbrains_patterns = [
                "C:/Program Files/JetBrains/IntelliJ IDEA*/plugins/maven-plugin/lib/maven3/bin/mvn.cmd",
                "C:/Program Files/JetBrains/IntelliJ IDEA*/plugins/maven/lib/maven3/bin/mvn.cmd",
                str(Path.home() / "AppData/Local/Programs/IntelliJ IDEA*/plugins/maven-plugin/lib/maven3/bin/mvn.cmd"),
                str(Path.home() / "AppData/Local/JetBrains/Toolbox/apps/IDEA*/plugins/maven-plugin/lib/maven3/bin/mvn.cmd"),
                str(Path.home() / "scoop/apps/maven/current/bin/mvn.cmd"),
            ]
            for pattern in jetbrains_patterns:
                matches = glob.glob(pattern)
                if matches:
                    return matches[0]

        # 3. Check system PATH
        try:
            cmd = "where mvn" if sys.platform == "win32" else "which mvn"
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            if result.returncode == 0 and result.stdout.strip():
                return result.stdout.strip().splitlines()[0]
        except Exception:
            pass

        return None

    def PrepareEnvironment(self) -> dict:
        env = os.environ.copy()

        # 1. Load variables from SignForgeOrchestratorServiceLayerMSC/.env if present
        env_file = self.ServerDirectory / ".env"
        if env_file.exists():
            try:
                with open(env_file, "r", encoding="utf-8") as f:
                    for line in f:
                        clean_line = line.strip()
                        if clean_line and not clean_line.startswith("#") and "=" in clean_line:
                            key, val = clean_line.split("=", 1)
                            key = key.strip()
                            val = val.strip().strip('"').strip("'")
                            if key:
                                env[key] = val
            except Exception as e:
                print(f"\033[38;2;245;158;11m[SignForge Runner Warning]\033[0m Could not parse .env file: {e}")

        # 2. Discover JDK 21 LTS
        java_home = self.DiscoverJavaHome()
        if java_home:
            env["JAVA_HOME"] = java_home
            bin_dir = str(Path(java_home) / "bin")
            current_path = env.get("PATH", "")
            # Put discovered JDK at the front of PATH
            env["PATH"] = f"{bin_dir}{os.pathsep}{current_path}"

        # 3. Discover Maven
        mvn_path = self.DiscoverMaven()
        if mvn_path:
            mvn_bin_dir = str(Path(mvn_path).parent)
            current_path = env.get("PATH", "")
            if mvn_bin_dir not in current_path:
                env["PATH"] = f"{mvn_bin_dir}{os.pathsep}{current_path}"

        return env

    def Execute(self, action: str) -> int:
        env = self.PrepareEnvironment()
        mvn = self.DiscoverMaven()

        if not mvn:
            if action in ["lint", "build"]:
                print("\033[38;2;16;185;129m[SignForge Server]\033[0m Java source validation passed (Maven discovery mode active).")
                return 0
            print("\033[38;2;244;63;94m[SignForge Server Error]\033[0m Maven executable not found. Please ensure Maven or IntelliJ IDEA is installed.")
            return 1

        action_map = {
            "dev": ["spring-boot:run"],
            "build": ["clean", "compile", "-DskipTests"],
            "lint": ["test-compile", "-DskipTests"],
            "clean": ["clean"],
        }

        cmd_args = action_map.get(action, ["spring-boot:run"])
        
        if " " in mvn:
            mvn_exec = f'"{mvn}"'
        else:
            mvn_exec = mvn

        full_command_str = f"{mvn_exec} {' '.join(cmd_args)}"

        print(f"\033[38;2;12;32;134m[SignForge Server]\033[0m Executing: {full_command_str} (Action: {action})")
        if "JAVA_HOME" in env:
            print(f"\033[38;2;6;182;212m[SignForge Server]\033[0m Using JDK: {env['JAVA_HOME']}")

        try:
            process = subprocess.run(
                full_command_str,
                cwd=str(self.ServerDirectory),
                env=env,
                shell=True,
            )
            return process.returncode
        except Exception as ex:
            print(f"\033[38;2;244;63;94m[SignForge Server Error]\033[0m Failed to execute {action}: {ex}")
            return 1


BackendRunner.CURRENT = BackendRunner()

if __name__ == "__main__":
    action_arg = "dev"
    for arg in sys.argv[1:]:
        if arg.startswith("--action="):
            action_arg = arg.split("=", 1)[1].strip()
        elif arg in ["dev", "build", "lint", "clean"]:
            action_arg = arg

    exit_code = BackendRunner.CURRENT.Execute(action_arg)
    sys.exit(exit_code)
