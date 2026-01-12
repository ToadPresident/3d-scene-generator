# Documentation Assets

This folder contains documentation assets for the project.

## Adding Demo Preview

To add a demo preview image:

1. Take a screenshot of the application
2. Save it as `demo-preview.png` in this folder
3. The README.md will automatically display it

## Recording Demo Video

To record a demo video:

1. Use QuickTime Player or OBS
2. Record the full generation flow
3. Convert to GIF using: `ffmpeg -i video.mov -vf "fps=10,scale=800:-1" demo.gif`
