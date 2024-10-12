FROM denoland/deno:2.0.0-rc.10

WORKDIR /app

# Prefer not to run as root.
USER deno

# The port that your application listens to.
EXPOSE 3060

# These steps will be re-run upon each file change in your working directory:
COPY . .

RUN deno cache src/**/*.ts

CMD ["run", "--watch", "-A", "src/index.ts"]
