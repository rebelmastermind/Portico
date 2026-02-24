(() => {
  const ns = (window.portico = window.portico || {});
  ns.DEFAULT_PROFILE = {
  "settings": {
    "bgImage": "https://wallpapersafari.com/download/9hEpyo/",
    "bgOpacity": 100,
    "bgBrightness": 100,
    "bgContrast": 100,
    "bgSaturation": 100,
    "bgBlur": 0,
    "fontFamily": "JetBrains Mono",
    "titleFontFamily": "Outfit",
    "subtitleFontFamily": "Outfit",
    "titleSize": 80,
    "titleColor": "#797163",
    "subtitleSize": 14,
    "subtitleColor": "#95836f",
    "tileTitleFontFamily": "Outfit",
    "tileTitleSize": 10,
    "tileTitleColor": "#e8eef7",
    "searchSize": 16,
    "searchColor": "#e0dcbd",
    "widgetColor": "#c1ab9a",
    "iconSize": 64,
    "iconRadius": 50,
    "showLogo": true,
    "logoImage": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB3aWR0aD0iNTAuNzk5OTk5bW0iCiAgIGhlaWdodD0iNTAuNzk5OTkybW0iCiAgIHZpZXdCb3g9IjEwNSAwIDUwLjc5OTk5OSA1MC43OTk5OTIiCiAgIHZlcnNpb249IjEuMSIKICAgaWQ9InN2ZzUiCiAgIHhtbDpzcGFjZT0icHJlc2VydmUiCiAgIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIgogICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzCiAgICAgaWQ9ImRlZnMyIj48bGluZWFyR3JhZGllbnQKICAgICAgIGlkPSJsaW5lYXJHcmFkaWVudDE3Ij48c3RvcAogICAgICAgICBzdHlsZT0ic3RvcC1jb2xvcjojODgxN2MyO3N0b3Atb3BhY2l0eToxOyIKICAgICAgICAgb2Zmc2V0PSIwIgogICAgICAgICBpZD0ic3RvcDE1IiAvPjxzdG9wCiAgICAgICAgIHN0eWxlPSJzdG9wLWNvbG9yOiM3ZWM2ZGQ7c3RvcC1vcGFjaXR5OjE7IgogICAgICAgICBvZmZzZXQ9IjAuNTEzMzg2NDkiCiAgICAgICAgIGlkPSJzdG9wMTYiIC8+PHN0b3AKICAgICAgICAgc3R5bGU9InN0b3AtY29sb3I6I2ZmZmZmZjtzdG9wLW9wYWNpdHk6MTsiCiAgICAgICAgIG9mZnNldD0iMC45OTk5OTk3NiIKICAgICAgICAgaWQ9InN0b3AxNyIgLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudAogICAgICAgaWQ9ImxpbmVhckdyYWRpZW50MTAiPjxzdG9wCiAgICAgICAgIHN0eWxlPSJzdG9wLWNvbG9yOiMyZTMwMzI7c3RvcC1vcGFjaXR5OjE7IgogICAgICAgICBvZmZzZXQ9IjAiCiAgICAgICAgIGlkPSJzdG9wMTAiIC8+PHN0b3AKICAgICAgICAgc3R5bGU9InN0b3AtY29sb3I6IzBhMTYyNDtzdG9wLW9wYWNpdHk6MTsiCiAgICAgICAgIG9mZnNldD0iMSIKICAgICAgICAgaWQ9InN0b3AxMSIgLz48L2xpbmVhckdyYWRpZW50PjxyYWRpYWxHcmFkaWVudAogICAgICAgeGxpbms6aHJlZj0iI2xpbmVhckdyYWRpZW50MTAiCiAgICAgICBpZD0icmFkaWFsR3JhZGllbnQxMSIKICAgICAgIGN4PSIzODMuMzA2ODIiCiAgICAgICBjeT0iODAuNDg4NDg3IgogICAgICAgZng9IjM4My4zMDY4MiIKICAgICAgIGZ5PSI4MC40ODg0ODciCiAgICAgICByPSI3Mi42NzY5NTYiCiAgICAgICBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KC0wLjQzMzc1MDI3LDEuMzQ4MDkzNywtMS40OTMxODI4LC0wLjQ4MDQzMjgxLDY4NC40MjcxMSwtMzczLjgzOTE3KSIKICAgICAgIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiAvPjxyYWRpYWxHcmFkaWVudAogICAgICAgeGxpbms6aHJlZj0iI2xpbmVhckdyYWRpZW50MTciCiAgICAgICBpZD0icmFkaWFsR3JhZGllbnQxMyIKICAgICAgIGN4PSI0MTQuNjAxNDQiCiAgICAgICBjeT0iMTY2Ljk4NzA1IgogICAgICAgZng9IjQxNC42MDE0NCIKICAgICAgIGZ5PSIxNjYuOTg3MDUiCiAgICAgICByPSIzMi41Nzg0NDIiCiAgICAgICBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDIuMTczNzE0MiwwLjExMDk3MDExLC0wLjA0ODEzNzE0LDAuOTQyOTI0MzQsLTQ0MC41MzIxNSwtMjUuNjY1ODk2KSIKICAgICAgIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiAvPjwvZGVmcz48ZwogICAgIGlkPSJsYXllcjEiCiAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTMxNi4xOTMyMiwtMTI0Ljk4NzcyKSI+PGcKICAgICAgIGlkPSJnMTciCiAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjgwODg5MzM3LDAsMCwwLjgwODg5MzM3LDc4LjgwMDQ3NCwzNC43NzYzNCkiCiAgICAgICBzdHlsZT0ic3Ryb2tlLXdpZHRoOjEuMjM2MjYiPjxwYXRoCiAgICAgICAgIGlkPSJwYXRoMTQiCiAgICAgICAgIHN0eWxlPSJmaWxsOnVybCgjcmFkaWFsR3JhZGllbnQxMyk7c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuMzI3MDkzIgogICAgICAgICBkPSJtIDQ1Ni45ODgyNCwxNzQuMjQyMDUgYSAzMS40MDA4ODEsMzEuNDAwODgxIDAgMCAwIDE1LjIxMDQ0LC01LjI1MjM5IFYgMTI1LjE4NTEgaCAtMzQuNzIwODcgbCAxOS41MTA0Myw3LjkzNjQ2IHoiIC8+PHBhdGgKICAgICAgICAgaWQ9InBhdGgyIgogICAgICAgICBzdHlsZT0iZmlsbDp1cmwoI3JhZGlhbEdyYWRpZW50MTEpO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDowLjMyNzA5MyIKICAgICAgICAgZD0ibSA0NzIuMTk4NjgsMTY4Ljk4OTY2IGEgMzEuNDAwODgxLDMxLjQwMDg4MSAwIDAgMCAxMy44ODg1NiwtMjYuMDY0MDUgMzEuNDAwODgxLDMxLjQwMDg4MSAwIDAgMCAtMzEuNDAxMTgsLTMxLjQwMTE4IDMxLjQwMDg4MSwzMS40MDA4ODEgMCAwIDAgLTMxLjQwMDY3LDMxLjQwMTE4IDMxLjQwMDg4MSwzMS40MDA4ODEgMCAwIDAgMzEuNDAwNjcsMzEuNDAwNjcgMzEuNDAwODgxLDMxLjQwMDg4MSAwIDAgMCAyLjMwMjE4LC0wLjA4NDIgdiAtNDEuMTIwNDkgbCAtMTkuNTEwNDMsLTcuOTM2NDYgaCAzNC43MjA4NyB6IiAvPjwvZz48L2c+PC9zdmc+Cg==",
    "logoOpacity": 33,
    "showSearchBar": true,
    "showWidget": true,
    "tempUnit": "C",
    "clockFormat": "12h",
    "searchEngine": "google",
    "searchBrightness": 77,
    "searchOpacity": 2,
    "searchBlur": 6,
    "titleText": "Portico",
    "subtitleText": "Drag cards to reorder. Hover to see the URL."
  },
  "widgets": [
    {
      "type": "link",
      "visible": true,
      "layout": {
        "w": 1,
        "h": 1
      },
      "config": {
        "title": "Wikipedia",
        "url": "https://wikipedia.com",
        "iconUrl": ""
      }
    },
    {
      "type": "link",
      "visible": true,
      "layout": {
        "w": 1,
        "h": 1
      },
      "config": {
        "title": "Reddit",
        "url": "https://reddit.com",
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/1409/1409938.png"
      }
    },
    {
      "type": "link",
      "visible": true,
      "layout": {
        "w": 1,
        "h": 1
      },
      "config": {
        "title": "GitHub",
        "url": "https://github.com",
        "iconUrl": "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/github-white-icon.png"
      }
    },
    {
      "type": "folder",
      "visible": true,
      "layout": {
        "w": 1,
        "h": 1
      },
      "config": {
        "title": "Google",
        "color": "#0f141f",
        "items": [
          {
            "title": "Gmail",
            "url": "https://mail.google.com",
            "iconUrl": ""
          },
          {
            "title": "Google Drive",
            "url": "https://drive.google.com",
            "iconUrl": "https://cdn.iconscout.com/icon/free/png-256/free-google-drive-logo-icon-svg-download-png-2416659.png?f=webp"
          },
          {
            "title": "Calendar",
            "url": "https://calendar.google.com",
            "iconUrl": ""
          },
          {
            "title": "Docs",
            "url": "https://www.docs.google.com",
            "iconUrl": "https://www.gstatic.com/images/branding/product/1x/docs_2020q4_48dp.png"
          },
          {
            "title": "Youtube",
            "url": "https://youtube.com",
            "iconUrl": "https://image.similarpng.com/file/similarpng/very-thumbnail/2020/05/Popular-Logo-YouTube-icon-PNG.png"
          },
          {
            "title": "NotebookLM",
            "url": "https://notebooklm.google/",
            "iconUrl": ""
          }
        ]
      }
    }
  ]
};
})();
