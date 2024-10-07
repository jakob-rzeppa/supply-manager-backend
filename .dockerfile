FROM denoland/deno:2.0.0-rc.10

# The port that your application listens to.
EXPOSE 3060

WORKDIR /app

# Prefer not to run as root.
USER deno

# These steps will be re-run upon each file change in your working directory:
COPY . .

CMD ["run", "--allow-net", "src/index.ts"]
