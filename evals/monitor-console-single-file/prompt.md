---
tags: [wandering-earth-fui-design]
max_turns: 40
timeout_seconds: 1500
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

I run a small 3D-print farm: 8 printers (IDs P-01 to P-08). For each one I have nozzle temp (°C), bed temp (°C), job progress (%), time remaining, and a state (printing, idle, paused, error). I want a mission-control style dashboard for the big monitor on the workshop wall and for my desk — sci-fi console look, like the screens in The Wandering Earth. No backend yet, so simulate the data, but I need to see what it looks like when a printer overheats and when one fails. One HTML file I can open by double-clicking. My staff read Chinese, I read English.
