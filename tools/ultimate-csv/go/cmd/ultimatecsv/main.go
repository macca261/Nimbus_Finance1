package main

import (
  "bufio"
  "fmt"
  "os"
)

func main() {
  // Minimal: echo health
  if len(os.Args) > 1 && os.Args[1] == "serve" {
    fmt.Println("ok")
    return
  }
  // Read stdin and echo
  in := bufio.NewScanner(os.Stdin)
  for in.Scan() {
    fmt.Println(in.Text())
  }
}


