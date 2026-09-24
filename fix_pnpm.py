with open("pnpm-lock.yaml", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "sharp" in line and not skip:
        # Check if it's the start of the sharp block
        if line.strip() == "sharp@0.35.3(@types/node@20.19.39):":
            new_lines.append(line)
        else:
            new_lines.append(line)
    else:
        new_lines.append(line)

# Since doing this manually in pnpm is tricky, let's just use `pnpm update`
