# Requirements

1. Run Stable diffusion with `set COMMANDLINE_ARGS=--api --cuda-malloc`
2. Run LLM studio, load a model
3. Open new powershell - Run `conda activate f5-tts` and then `f5-tts_infer-gradio`

## TODO

- Exposes options to end user, basically everything possible - Models / LORAs / Prompts / command arguments
- Save current state of site to local, export via URL, load from URL
- Add another LLM thread to act as a director, embedding challenges and puzzles into responses, when certain criteria are met
- Director LLM can also create a prompt for the stable diffusion scene
