import subprocess
import sys
import unittest
from pathlib import Path


SCRIPT_PATH = Path(__file__).resolve().parent.parent / "scripts" / "fetch_douyin_video.py"


def load_module():
    import importlib.util

    spec = importlib.util.spec_from_file_location("fetch_douyin_video", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class NormalizeInputUrlTests(unittest.TestCase):
    def setUp(self):
        self.module = load_module()

    def test_converts_jingxuan_modal_id_to_standard_video_url(self):
        input_url = "https://www.douyin.com/jingxuan?modal_id=7603361114428050722"

        normalized_url = self.module.normalize_input_url(input_url)

        self.assertEqual(normalized_url, "https://www.douyin.com/video/7603361114428050722")

    def test_converts_jingxuan_mobile_video_url_to_standard_video_url(self):
        input_url = "https://jingxuan.douyin.com/m/video/7619827947536738030"

        normalized_url = self.module.normalize_input_url(input_url)

        self.assertEqual(normalized_url, "https://www.douyin.com/video/7619827947536738030")

    def test_builds_default_output_paths_for_all_assets(self):
        paths = self.module.build_download_plan("all", "7603361114428050722", None)

        self.assertEqual(paths["video"], Path("/tmp/douyin-7603361114428050722.mp4"))
        self.assertEqual(paths["audio"], Path("/tmp/douyin-7603361114428050722.mp3"))
        self.assertEqual(paths["cover"], Path("/tmp/douyin-7603361114428050722.jpg"))


class CliHelpTests(unittest.TestCase):
    def test_top_level_help_mentions_subcommands(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPT_PATH), "--help"],
            check=False,
            capture_output=True,
            text=True,
        )

        self.assertEqual(result.returncode, 0)
        self.assertIn("video", result.stdout)
        self.assertIn("audio", result.stdout)
        self.assertIn("cover", result.stdout)
        self.assertIn("all", result.stdout)

    def test_subcommand_help_mentions_output_option(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPT_PATH), "audio", "--help"],
            check=False,
            capture_output=True,
            text=True,
        )

        self.assertEqual(result.returncode, 0)
        self.assertIn("--output", result.stdout)
        self.assertIn("--url", result.stdout)


if __name__ == "__main__":
    unittest.main()
