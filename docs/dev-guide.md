## Whispen Developer Guide – Adding Ambient Sounds & Themes
---
### Adding Ambient Sounds:
```
{
    id: 'soundname',
    name: 'Sound Name',
    src: './assets/sounds/test.mp3'
  }
```

➡ Replace the values above with your own sound's ID, name, and file path.

➡ Then paste this object inside the 
**const soundLibrary = []**
array in soundsystem.js.
(Located near the top – Line 1)

---

### Adding Themes:
```
        <div data-i18n="yourthemename" class="yourthemename" onclick="selectTheme('yourthemename-style')" style="aspect-ratio: 1; border-radius: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; background: linear-gradient(135deg, rgba(248,249,250,1) 0%, rgba(233,236,239,1) 100%), url('default-theme-bg.png') center/cover;font-family: Inter; position: relative; overflow: hidden; padding: 5px; color: black;">
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(248,249,250,0.8);"></div>
      <div style="position: relative; z-index: 2; font-size: 18px; font-weight: 600; color: #495057; text-shadow: 0 1px 2px rgba(255,255,255,0.8);">yourthemename</div>
    </div>
```

1. Add the block above into the .themesdiv container in your HTML.

2. Replace the data-i18n attribute with your theme key. Also, add its translation in lang.json. This is for multilingual support.

3. Change yourthemename in onclick="selectTheme('yourthemename-style')" and the class value. Keep the -style suffix.

4. Define your theme’s styles like below:

```
.theme-style {
  --bg-color: #f0f0f0;
  --text-color: white;
  --text-color2: black;
  --navbar-color: #1f2937;
  --menu-color: #1f2937;
  --controlbar-color: white;
  --button-color: #374151;
  --navborder-radius: 0px 0px 10px 10px;
}
```

5. In script.js, find the comment **// Clear all theme classes** (around line 232).
6. 
➤ Add your new theme class to the list right there.

---
> [!IMPORTANT]
> IDs and theme names must be unique.