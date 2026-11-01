## Show the full QPi logo in the installed app icon

Right now the install icon is cropped to just the swirl "Q" (made that way when the browser-tab icon was created). The plan below switches it to the full "QPi." logo.

### What changes
- Rebuild the two install icons (192px and 512px) from the full cleaned logo, the same one used on the login screen, so they show "Q", "Pi." and both gold dots.
- Keep the transparent background with no box or rounded square, as you asked before.
- Centre the logo with a small margin so no part gets cut off. The logo is wide, so it fills the width and sits in the middle of the square.
- Leave the small browser-tab icon as the Q only, since the full logo would be too small to read at that size. I can change that too if you'd like.

### Note
Phones keep their copy of the icon from when the app was installed. If QPi is already installed, remove it and install it again to see the new icon.

### Technical details
- Regenerate `public/icon-192.png` and `public/icon-512.png` with PIL from the cleaned logo PNG: trim it to its edges, scale it to about 88% of the canvas width, and centre it on a transparent RGBA square.
- The manifest stays the same (`purpose: "any"`).
- Check by viewing both icons over light and dark backgrounds.
