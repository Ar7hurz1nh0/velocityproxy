export const config: Config = {
  velocity: {
    java_path: "java",
    java_args: [
      "-XX:+AlwaysPreTouch",
      "-Xmx600M",
      "-jar", "velocity.jar"
    ]
  }
}