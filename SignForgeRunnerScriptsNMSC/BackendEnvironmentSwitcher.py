import os
import sys
import time
import json
import urllib.request
import urllib.error
from pathlib import Path
from typing import Dict, Tuple

# Enable UTF-8 encoding and ANSI Virtual Terminal Processing on Windows
if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8")
        os.system("")
    except Exception:
        pass


class TerminalThemeClass:
    RESET: str = "\033[0m"
    BOLD: str = "\033[1m"
    DIM: str = "\033[2m"
    ITALIC: str = "\033[3m"
    UNDERLINE: str = "\033[4m"

    # SignForge Brand Palette
    PRIMARY_BLUE: str = "\033[38;2;12;32;134m"     # #0C2086
    ACCENT_CYAN: str = "\033[38;2;6;182;212m"      # #06B6D4
    ACCENT_EMERALD: str = "\033[38;2;16;185;129m"  # #10B981
    ACCENT_AMBER: str = "\033[38;2;245;158;11m"    # #F59E0B
    ACCENT_ROSE: str = "\033[38;2;244;63;94m"      # #F43F5E
    SLATE_MUTED: str = "\033[38;2;148;163;184m"    # #94A3B8
    SLATE_DARK: str = "\033[38;2;71;85;105m"       # #475569
    TEXT_LIGHT: str = "\033[38;2;248;250;252m"     # #F8FAFC

    # Box Drawing Glyphs
    TOP_LEFT: str = "╭"
    TOP_RIGHT: str = "╮"
    BOTTOM_LEFT: str = "╰"
    BOTTOM_RIGHT: str = "╯"
    HORIZONTAL: str = "─"
    VERTICAL: str = "│"
    CROSS: str = "┼"
    LEFT_T: str = "├"
    RIGHT_T: str = "┤"
    TOP_T: str = "┬"
    BOTTOM_T: str = "┴"
    BULLET: str = "◆"
    ARROW: str = "➜"
    CHECK: str = "✔"
    CROSS_MARK: str = "✖"


class EnvironmentTargetClass:
    def __init__(
        self,
        Key: str,
        Name: str,
        BaseUrl: str,
        Description: str,
        BadgeColor: str,
    ) -> None:
        self.Key: str = Key
        self.Name: str = Name
        self.BaseUrl: str = BaseUrl.rstrip("/")
        self.Description: str = Description
        self.BadgeColor: str = BadgeColor


class BackendEnvironmentSwitcher:
    Current: "BackendEnvironmentSwitcher"

    TARGET_LOCAL: str = "local"
    TARGET_LIVE: str = "live"
    TARGET_STATUS: str = "status"

    def __init__(self) -> None:
        self.RootDirectory: Path = Path(__file__).resolve().parent.parent
        self.ClientDirectory: Path = self.RootDirectory / "SignForgeClientServiceLayerMSC"
        self.EnvFilePath: Path = self.ClientDirectory / ".env"

        self.Targets: Dict[str, EnvironmentTargetClass] = {
            self.TARGET_LOCAL: EnvironmentTargetClass(
                Key="local",
                Name="Localhost Development Orchestrator",
                BaseUrl="http://localhost:8080",
                Description="Local Spring Boot 3 / Java daemon running on port 8080 with endpoints at /Api/V1/*",
                BadgeColor=TerminalThemeClass.ACCENT_CYAN,
            ),
            self.TARGET_LIVE: EnvironmentTargetClass(
                Key="live",
                Name="SignForge Enterprise Cloud API",
                BaseUrl="https://signforge.theweplm.com",
                Description="Production Cloud Orchestrator API Gateway with endpoints at /Api/V1/*",
                BadgeColor=TerminalThemeClass.ACCENT_EMERALD,
            ),
        }

    def GetTerminalWidth(self) -> int:
        try:
            return min(max(os.get_terminal_size().columns, 85), 120)
        except Exception:
            return 95

    def ReadCurrentBaseUrl(self) -> str:
        if not self.EnvFilePath.exists():
            return self.Targets[self.TARGET_LOCAL].BaseUrl

        try:
            with open(self.EnvFilePath, "r", encoding="utf-8") as f:
                for line in f:
                    clean_line = line.strip()
                    if clean_line.startswith("SIGNFORGE_BACKEND_BASE_URL="):
                        val = clean_line.split("=", 1)[1].strip().strip('"').strip("'")
                        val = val.replace("http://", "").replace("https://", "").rstrip("/")
                        if val == "localhost:8080" or "localhost" in val:
                            return f"http://{val}"
                        return f"https://{val}"
        except Exception:
            pass

        return self.Targets[self.TARGET_LOCAL].BaseUrl

    def WriteBaseUrl(self, NewBaseUrl: str) -> None:
        clean_target = NewBaseUrl.replace("http://", "").replace("https://", "").rstrip("/")
        lines: list[str] = [
            "# SignForge Client Service Layer Environment Configuration\n",
            f"SIGNFORGE_BACKEND_BASE_URL={clean_target}\n",
            f"VITE_SIGNFORGE_BACKEND_BASE_URL={NewBaseUrl}\n",
            f"VITE_BACKEND_API_BASE_URL={NewBaseUrl}\n",
            f"VITE_API_BASE_URL={NewBaseUrl}\n",
        ]

        with open(self.EnvFilePath, "w", encoding="utf-8") as f:
            f.writelines(lines)

    def ProbeServerHealth(self, BaseUrl: str) -> Tuple[bool, int, str]:
        health_url = f"{BaseUrl.rstrip('/')}/Api/V1/HealthCheck"
        start_time = time.time()
        try:
            req = urllib.request.Request(
                health_url,
                headers={"User-Agent": "SignForge-CLI-Environment-Probe"},
            )
            with urllib.request.urlopen(req, timeout=4.0) as response:
                latency_ms = int((time.time() - start_time) * 1000)
                if response.status == 200:
                    raw_data = response.read().decode("utf-8")
                    try:
                        parsed = json.loads(raw_data)
                        overall_status = parsed.get("Data", {}).get("OverallStatus") or parsed.get("data", {}).get("overallStatus", "Healthy")
                        return (True, latency_ms, f"{overall_status} (HTTP 200)")
                    except Exception:
                        return (True, latency_ms, "Healthy (HTTP 200)")
                return (False, latency_ms, f"HTTP {response.status}")
        except urllib.error.HTTPError as http_err:
            latency_ms = int((time.time() - start_time) * 1000)
            return (False, latency_ms, f"HTTP {http_err.code}")
        except Exception:
            latency_ms = int((time.time() - start_time) * 1000)
            return (False, latency_ms, "Unreachable / Server Offline")

    def RenderBanner(self, Width: int, Title: str, Subtitle: str) -> None:
        T = TerminalThemeClass
        inner_width = Width - 4

        print()
        print(f"{T.PRIMARY_BLUE}{T.TOP_LEFT}{T.HORIZONTAL * (Width - 2)}{T.TOP_RIGHT}{T.RESET}")
        print(f"{T.PRIMARY_BLUE}{T.VERTICAL}{T.RESET} {T.BOLD}{T.ACCENT_CYAN}{Title.center(inner_width)}{T.RESET} {T.PRIMARY_BLUE}{T.VERTICAL}{T.RESET}")
        print(f"{T.PRIMARY_BLUE}{T.VERTICAL}{T.RESET} {T.SLATE_MUTED}{Subtitle.center(inner_width)}{T.RESET} {T.PRIMARY_BLUE}{T.VERTICAL}{T.RESET}")
        print(f"{T.PRIMARY_BLUE}{T.BOTTOM_LEFT}{T.HORIZONTAL * (Width - 2)}{T.BOTTOM_RIGHT}{T.RESET}")
        print()

    def RenderStatusCard(
        self,
        TargetKey: str,
        Target: EnvironmentTargetClass,
        IsActive: bool,
        Width: int,
        ProbeHealth: bool = True,
    ) -> None:
        T = TerminalThemeClass

        health_ok, latency, health_detail = (False, 0, "Not probed")
        if ProbeHealth:
            health_ok, latency, health_detail = self.ProbeServerHealth(Target.BaseUrl)

        active_badge = f"{T.BOLD}{T.ACCENT_EMERALD}[ ACTIVE TARGET ]{T.RESET}" if IsActive else f"{T.SLATE_DARK}[ INACTIVE ]{T.RESET}"
        health_badge = (
            f"{T.ACCENT_EMERALD}{T.CHECK} {health_detail} ({latency}ms){T.RESET}"
            if health_ok
            else f"{T.ACCENT_ROSE}{T.CROSS_MARK} {health_detail}{T.RESET}"
        )

        inner_w = Width - 6
        left_header = f"● {Target.Name}"
        badge_plain = "[ ACTIVE TARGET ]" if IsActive else "[ INACTIVE ]"
        gap_header = max(inner_w - len(left_header) - len(badge_plain), 2)

        print(f"  {T.SLATE_DARK}{T.TOP_LEFT}{T.HORIZONTAL * (Width - 4)}{T.TOP_RIGHT}{T.RESET}")
        print(f"  {T.SLATE_DARK}{T.VERTICAL}{T.RESET} {T.BOLD}{Target.BadgeColor}{left_header}{T.RESET}{' ' * gap_header}{active_badge} {T.SLATE_DARK}{T.VERTICAL}{T.RESET}")
        print(f"  {T.SLATE_DARK}{T.LEFT_T}{T.HORIZONTAL * (Width - 4)}{T.RIGHT_T}{T.RESET}")

        # Row 1: Base URL
        url_label = "Base URL:"
        url_content = Target.BaseUrl
        url_gap = max(inner_w - len(url_label) - 1 - len(url_content), 0)
        print(f"  {T.SLATE_DARK}{T.VERTICAL}{T.RESET} {T.BOLD}{T.TEXT_LIGHT}{url_label}{T.RESET} {T.ACCENT_CYAN}{url_content}{T.RESET}{' ' * url_gap} {T.SLATE_DARK}{T.VERTICAL}{T.RESET}")

        # Row 2: Details
        desc_label = "Details: "
        desc_max_len = inner_w - len(desc_label) - 1
        desc_content = Target.Description[:desc_max_len]
        desc_gap = max(inner_w - len(desc_label) - 1 - len(desc_content), 0)
        print(f"  {T.SLATE_DARK}{T.VERTICAL}{T.RESET} {T.BOLD}{T.TEXT_LIGHT}{desc_label}{T.RESET} {T.SLATE_MUTED}{desc_content}{T.RESET}{' ' * desc_gap} {T.SLATE_DARK}{T.VERTICAL}{T.RESET}")

        # Row 3: Health Ping
        health_label = "Health:  "
        health_plain = f"{health_detail} ({latency}ms)" if health_ok else health_detail
        health_plain_len = len(health_plain) + 2
        health_gap = max(inner_w - len(health_label) - 1 - health_plain_len, 0)
        print(f"  {T.SLATE_DARK}{T.VERTICAL}{T.RESET} {T.BOLD}{T.TEXT_LIGHT}{health_label}{T.RESET} {health_badge}{' ' * health_gap} {T.SLATE_DARK}{T.VERTICAL}{T.RESET}")
        print(f"  {T.SLATE_DARK}{T.BOTTOM_LEFT}{T.HORIZONTAL * (Width - 4)}{T.BOTTOM_RIGHT}{T.RESET}")
        print()

    def SwitchTo(self, TargetKey: str) -> None:
        T = TerminalThemeClass
        width = self.GetTerminalWidth()

        if TargetKey not in self.Targets:
            print(f"{T.ACCENT_ROSE}Error: Unknown target '{TargetKey}'. Available targets: local, live{T.RESET}")
            return

        target = self.Targets[TargetKey]
        self.WriteBaseUrl(target.BaseUrl)

        self.RenderBanner(
            width,
            "SIGNFORGE BACKEND TARGET SWITCHER",
            f"Active Frontend Gateway Configured: {target.Name}",
        )

        print(f" {T.BOLD}{T.ACCENT_EMERALD}{T.BULLET} Successfully Updated Environment Configuration:{T.RESET}")
        print(f"   {T.SLATE_MUTED}File:{T.RESET} {T.TEXT_LIGHT}{self.EnvFilePath}{T.RESET}")
        print(f"   {T.SLATE_MUTED}Key:{T.RESET}  {T.ACCENT_CYAN}VITE_BACKEND_API_BASE_URL={target.BaseUrl}{T.RESET}")
        print()

        print(f" {T.BOLD}{T.TEXT_LIGHT}{T.ARROW} Probing Gateway Diagnostics...{T.RESET}")
        print()
        self.RenderStatusCard(TargetKey, target, IsActive=True, Width=width, ProbeHealth=True)

        print(f" {T.SLATE_MUTED}Tip: Run {T.BOLD}{T.ACCENT_CYAN}bun run client:dev{T.RESET}{T.SLATE_MUTED} or {T.BOLD}{T.ACCENT_CYAN}bun run dev{T.RESET}{T.SLATE_MUTED} to start your React client with this backend.{T.RESET}")
        print()

    def ShowStatus(self) -> None:
        T = TerminalThemeClass
        width = self.GetTerminalWidth()
        current_url = self.ReadCurrentBaseUrl()

        self.RenderBanner(
            width,
            "SIGNFORGE BACKEND GATEWAY STATUS",
            "Multi-Target Environment Diagnostic Overview",
        )

        print(f" {T.BOLD}{T.TEXT_LIGHT}{T.BULLET} Configured Environment Targets:{T.RESET}")
        print()

        for key, target in self.Targets.items():
            is_active = (current_url.lower() == target.BaseUrl.lower())
            self.RenderStatusCard(key, target, IsActive=is_active, Width=width, ProbeHealth=True)

        print(f" {T.BOLD}{T.ACCENT_CYAN}{T.ARROW} Switch Commands:{T.RESET}")
        print(f"   • Switch to Live Cloud API:    {T.BOLD}{T.ACCENT_EMERALD}bun run backend:live{T.RESET}")
        print(f"   • Switch to Localhost Server:  {T.BOLD}{T.ACCENT_CYAN}bun run backend:local{T.RESET}")
        print()

    def Run(self) -> None:
        target_arg = self.TARGET_STATUS
        for arg in sys.argv[1:]:
            if arg.startswith("--target="):
                target_arg = arg.split("=", 1)[1].strip().lower()
            elif arg in ["live", "local", "status"]:
                target_arg = arg.lower()

        if target_arg in [self.TARGET_LOCAL, self.TARGET_LIVE]:
            self.SwitchTo(target_arg)
        else:
            self.ShowStatus()


# Singleton Instance Instantiation
BackendEnvironmentSwitcher.Current = BackendEnvironmentSwitcher()

if __name__ == "__main__":
    BackendEnvironmentSwitcher.Current.Run()
