import os
import sys
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple

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


class ScriptItemClass:
    def __init__(
        self,
        Name: str,
        Command: str,
        Category: str,
        Workspace: str,
        Description: str,
        SuggestedExecution: str = "",
    ) -> None:
        self.Name: str = Name
        self.Command: str = Command
        self.Category: str = Category
        self.Workspace: str = Workspace
        self.Description: str = Description
        self.SuggestedExecution: str = SuggestedExecution or f"bun run {Name}"


class CommandParserClass:
    def __init__(self, RootDirectory: Path) -> None:
        self.RootDirectory: Path = RootDirectory

    def GetScriptDescription(self, ScriptName: str, Workspace: str, Command: str) -> Tuple[str, str]:
        """Returns (Category, Description) based on script semantics."""
        name_lower = ScriptName.lower()

        if Workspace == "Root Monorepo":
            if "start:dev" in name_lower or name_lower == "dev":
                return (
                    "Unified Full-Stack Orchestration",
                    "Concurrently launches Spring Boot API Server (8080) & React Client (3000) with live stream",
                )
            if "start:build" in name_lower or name_lower == "build":
                return (
                    "Unified Full-Stack Orchestration",
                    "Concurrently compiles Spring Boot API Server and builds React Client with Turbo caching",
                )
            if "start:lint" in name_lower or name_lower == "lint":
                return (
                    "Unified Full-Stack Orchestration",
                    "Runs TypeScript type-checking on Client and compilation checks on Java Server",
                )
            if name_lower == "clean":
                return (
                    "Unified Full-Stack Orchestration",
                    "Purges dist/, target/ artifacts across all workspaces",
                )
            if "client:dev" in name_lower:
                return (
                    "Client Frontend (@signforge/client)",
                    "Starts Vite development server and Express host for React client only",
                )
            if "client:build" in name_lower:
                return (
                    "Client Frontend (@signforge/client)",
                    "Builds production client bundles (Vite build)",
                )
            if "client:lint" in name_lower:
                return (
                    "Client Frontend (@signforge/client)",
                    "Runs static TypeScript compiler check (tsc --noEmit)",
                )
            if "client:install" in name_lower or "client install" in name_lower:
                return (
                    "Client Frontend (@signforge/client)",
                    "Installs or updates dependencies strictly in SignForgeClientServiceLayerMSC",
                )
            if "server:dev" in name_lower:
                return (
                    "Backend Server (@signforge/server)",
                    "Runs Spring Boot orchestrator daemon directly with smart JDK auto-discovery",
                )
            if "server:build" in name_lower:
                return (
                    "Backend Server (@signforge/server)",
                    "Compiles Spring Boot solution and verifies dependencies",
                )
            if "server:lint" in name_lower:
                return (
                    "Backend Server (@signforge/server)",
                    "Executes silent Maven compilation checks for warnings and errors",
                )
            if "backend:live" in name_lower or "backend live" in name_lower:
                return (
                    "Environment & Cloud Management",
                    "Switches frontend target to live cloud API gateway (https://signforge.theweplm.com/api/v1)",
                )
            if "backend:local" in name_lower or "backend local" in name_lower:
                return (
                    "Environment & Cloud Management",
                    "Switches frontend target to localhost Spring Boot server (http://localhost:8080/api/v1)",
                )
            if "backend:status" in name_lower or "backend status" in name_lower:
                return (
                    "Environment & Cloud Management",
                    "Displays active backend gateway and runs live health check diagnostic probe",
                )
            if "list:cmd" in name_lower or "list cmd" in name_lower:
                return (
                    "Developer Tooling & Scripts",
                    "Displays this categorized interactive command menu table in the terminal",
                )
            return ("General Utilities", f"Executes: {Command}")

        if Workspace == "@signforge/client":
            if name_lower == "dev":
                return ("Client Workspace Scripts", "Runs Vite development server on port 3000")
            if name_lower == "build":
                return ("Client Workspace Scripts", "Executes Vite production build")
            if name_lower == "lint":
                return ("Client Workspace Scripts", "Executes tsc --noEmit type safety validation")
            if name_lower == "clean":
                return ("Client Workspace Scripts", "Removes dist/ folder and build artifacts")
            return ("Client Workspace Scripts", f"Executes: {Command}")

        if Workspace == "@signforge/server":
            if name_lower == "dev":
                return ("Server Workspace Scripts", "Runs Spring Boot application (spring-boot:run)")
            if name_lower == "build":
                return ("Server Workspace Scripts", "Compiles Spring Boot project")
            if name_lower == "lint":
                return ("Server Workspace Scripts", "Executes Maven test-compile check")
            if name_lower == "clean":
                return ("Server Workspace Scripts", "Executes Maven clean")
            return ("Server Workspace Scripts", f"Executes: {Command}")

        return ("Custom Scripts", f"Executes: {Command}")

    def ParseAllScripts(self) -> List[ScriptItemClass]:
        scripts_list: List[ScriptItemClass] = []

        # 1. Root package.json
        root_pkg_path = self.RootDirectory / "package.json"
        if root_pkg_path.exists():
            try:
                with open(root_pkg_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    scripts = data.get("scripts", {})
                    for name, cmd in scripts.items():
                        cat, desc = self.GetScriptDescription(name, "Root Monorepo", cmd)
                        scripts_list.append(
                            ScriptItemClass(
                                Name=name,
                                Command=cmd,
                                Category=cat,
                                Workspace="Root Monorepo",
                                Description=desc,
                                SuggestedExecution=f"bun run {name}" if " " not in name else f'bun run "{name}"',
                            )
                        )
            except Exception as ex:
                print(f"Warning: Could not parse root package.json: {ex}")

        # 2. Client Workspace package.json
        client_pkg_path = self.RootDirectory / "SignForgeClientServiceLayerMSC" / "package.json"
        if client_pkg_path.exists():
            try:
                with open(client_pkg_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    workspace_name = data.get("name", "@signforge/client")
                    scripts = data.get("scripts", {})
                    for name, cmd in scripts.items():
                        cat, desc = self.GetScriptDescription(name, workspace_name, cmd)
                        scripts_list.append(
                            ScriptItemClass(
                                Name=name,
                                Command=cmd,
                                Category=cat,
                                Workspace=workspace_name,
                                Description=desc,
                                SuggestedExecution=f"bun --filter=@signforge/client {name}",
                            )
                        )
            except Exception as ex:
                print(f"Warning: Could not parse client package.json: {ex}")

        # 3. Server Workspace package.json
        server_pkg_path = self.RootDirectory / "SignForgeOrchestratorServiceLayerMSC" / "package.json"
        if server_pkg_path.exists():
            try:
                with open(server_pkg_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    workspace_name = data.get("name", "@signforge/server")
                    scripts = data.get("scripts", {})
                    for name, cmd in scripts.items():
                        cat, desc = self.GetScriptDescription(name, workspace_name, cmd)
                        scripts_list.append(
                            ScriptItemClass(
                                Name=name,
                                Command=cmd,
                                Category=cat,
                                Workspace=workspace_name,
                                Description=desc,
                                SuggestedExecution=f"bun --filter=@signforge/server {name}",
                            )
                        )
            except Exception as ex:
                print(f"Warning: Could not parse server package.json: {ex}")

        return scripts_list


class CommandList:
    Current: "CommandList"

    def __init__(self) -> None:
        self.RootDirectory: Path = Path(__file__).resolve().parent.parent
        self.Parser: CommandParserClass = CommandParserClass(self.RootDirectory)

    def GetTerminalWidth(self) -> int:
        try:
            return min(max(os.get_terminal_size().columns, 90), 130)
        except Exception:
            return 110

    def RenderHeaderBanner(self, Width: int) -> None:
        T = TerminalThemeClass
        inner_width = Width - 4

        title_text = "SIGNFORGE ENTERPRISE MONOREPO COMMAND CENTER"
        subtitle_text = "Bun Workspaces + Turborepo • React 19 Client + Spring Boot 3 Server"

        print()
        print(f"{T.PRIMARY_BLUE}{T.TOP_LEFT}{T.HORIZONTAL * (Width - 2)}{T.TOP_RIGHT}{T.RESET}")
        print(f"{T.PRIMARY_BLUE}{T.VERTICAL}{T.RESET} {T.BOLD}{T.ACCENT_CYAN}{title_text.center(inner_width)}{T.RESET} {T.PRIMARY_BLUE}{T.VERTICAL}{T.RESET}")
        print(f"{T.PRIMARY_BLUE}{T.VERTICAL}{T.RESET} {T.SLATE_MUTED}{subtitle_text.center(inner_width)}{T.RESET} {T.PRIMARY_BLUE}{T.VERTICAL}{T.RESET}")
        print(f"{T.PRIMARY_BLUE}{T.BOTTOM_LEFT}{T.HORIZONTAL * (Width - 2)}{T.BOTTOM_RIGHT}{T.RESET}")
        print()

    def RenderCategoryTable(self, CategoryName: str, Items: List[ScriptItemClass], Width: int) -> None:
        T = TerminalThemeClass
        if not Items:
            return

        max_cmd_len = max(len(item.SuggestedExecution) for item in Items)
        max_ws_len = max(len(item.Workspace) for item in Items)

        col1_w = max(min(max_cmd_len, 42), 26)
        col2_w = max(min(max_ws_len, 26), 20)
        col3_w = Width - col1_w - col2_w - 10
        if col3_w < 32:
            col3_w = 32

        print(f" {T.BOLD}{T.ACCENT_EMERALD}{T.BULLET} {CategoryName.upper()}{T.RESET} {T.SLATE_DARK}({len(Items)} script{'s' if len(Items) > 1 else ''}){T.RESET}")
        print(f"  {T.SLATE_DARK}{T.TOP_LEFT}{T.HORIZONTAL * (col1_w + 2)}{T.TOP_T}{T.HORIZONTAL * (col2_w + 2)}{T.TOP_T}{T.HORIZONTAL * (col3_w + 2)}{T.TOP_RIGHT}{T.RESET}")

        c1 = "COMMAND / ALIAS".ljust(col1_w)
        c2 = "WORKSPACE / TARGET".ljust(col2_w)
        c3 = "DESCRIPTION & FUNCTION".ljust(col3_w)
        print(f"  {T.SLATE_DARK}{T.VERTICAL}{T.RESET} {T.BOLD}{T.TEXT_LIGHT}{c1}{T.RESET} {T.SLATE_DARK}{T.VERTICAL}{T.RESET} {T.BOLD}{T.TEXT_LIGHT}{c2}{T.RESET} {T.SLATE_DARK}{T.VERTICAL}{T.RESET} {T.BOLD}{T.TEXT_LIGHT}{c3}{T.RESET} {T.SLATE_DARK}{T.VERTICAL}{T.RESET}")
        print(f"  {T.SLATE_DARK}{T.LEFT_T}{T.HORIZONTAL * (col1_w + 2)}{T.CROSS}{T.HORIZONTAL * (col2_w + 2)}{T.CROSS}{T.HORIZONTAL * (col3_w + 2)}{T.RIGHT_T}{T.RESET}")

        for item in Items:
            cmd_display = f"{T.ACCENT_CYAN}{item.SuggestedExecution[:col1_w].ljust(col1_w)}{T.RESET}"
            ws_display = f"{T.ACCENT_AMBER if 'Client' in item.Workspace or 'client' in item.Workspace else (T.ACCENT_ROSE if 'Server' in item.Workspace or 'server' in item.Workspace else T.SLATE_MUTED)}{item.Workspace[:col2_w].ljust(col2_w)}{T.RESET}"
            desc_display = f"{T.TEXT_LIGHT}{item.Description[:col3_w].ljust(col3_w)}{T.RESET}"

            print(f"  {T.SLATE_DARK}{T.VERTICAL}{T.RESET} {cmd_display} {T.SLATE_DARK}{T.VERTICAL}{T.RESET} {ws_display} {T.SLATE_DARK}{T.VERTICAL}{T.RESET} {desc_display} {T.SLATE_DARK}{T.VERTICAL}{T.RESET}")

        print(f"  {T.SLATE_DARK}{T.BOTTOM_LEFT}{T.HORIZONTAL * (col1_w + 2)}{T.BOTTOM_T}{T.HORIZONTAL * (col2_w + 2)}{T.BOTTOM_T}{T.HORIZONTAL * (col3_w + 2)}{T.BOTTOM_RIGHT}{T.RESET}")
        print()

    def ShowList(self) -> None:
        T = TerminalThemeClass
        width = self.GetTerminalWidth()
        self.RenderHeaderBanner(width)

        all_scripts = self.Parser.ParseAllScripts()

        categories: Dict[str, List[ScriptItemClass]] = {}
        for script in all_scripts:
            categories.setdefault(script.Category, []).append(script)

        category_order = [
            "Unified Full-Stack Orchestration",
            "Environment & Cloud Management",
            "Client Frontend (@signforge/client)",
            "Backend Server (@signforge/server)",
            "Developer Tooling & Scripts",
            "Client Workspace Scripts",
            "Server Workspace Scripts",
            "General Utilities",
            "Custom Scripts",
        ]

        for cat in category_order:
            if cat in categories:
                self.RenderCategoryTable(cat, categories[cat], width)

        for cat, items in categories.items():
            if cat not in category_order:
                self.RenderCategoryTable(cat, items, width)

        print(f" {T.BOLD}{T.ACCENT_CYAN}{T.ARROW} Quick Start Tip:{T.RESET} Run {T.BOLD}{T.ACCENT_EMERALD}bun run start:dev{T.RESET} or {T.BOLD}{T.ACCENT_EMERALD}turbo dev{T.RESET} to start both Frontend & Backend concurrently.")
        print()


# Singleton Instance Instantiation
CommandList.Current = CommandList()

if __name__ == "__main__":
    CommandList.Current.ShowList()
