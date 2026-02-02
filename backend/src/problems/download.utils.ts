import JSZip from "jszip"
import { MainFilesHistory } from "./index.utils"
import { FileType } from "@shared/types/problem"

export async function create_zip(
  files: {
    file_name: string,
    content: string,
    created_at: string,
  }[],
) {
  let zip = new JSZip()
  for (let file of files) {
    zip.file(file.file_name, file.content, { date: new Date(file.created_at) })
  }
  return zip.generateAsync({ type: "blob" })
}

export function divide_files_into_rounds(
  files: {
    file_name: string,
    file_type: FileType,
    content: string,
    created_at: string,
    round: { index: number, },
  }[],
  main_files: MainFilesHistory,
) {
  const result = []
  for (let file of files) {
    // If round zero, then we're interested only in "task"
    // all other main files are reconstructed separately
    if (file.round.index === 0) {
      if (file.file_type === "task") {
        result.push({
          file_name: "task.md",
          content: file.content,
          created_at: file.created_at,
        })
      }
      continue
    }
    
    // Round > 0
    let file_name = file.file_name.split(".")[0]
    let file_type = file.file_name.split(".")[1]
    let name = ""
    if (file_name === "round_instructions") {
      name = file.file_name
    } else {
      let extension
      try {
        JSON.parse(file.content)
        extension = "json"
      } catch (_) {
        extension = "md"
      }
      name = `${file_type}s/${file_name}.${extension}`
    }
    result.push({
      file_name: `round-${file.round.index}/${name}`,
      content: file.content,
      created_at: file.created_at,
    })
  }
  
  for (let main of main_files) {
    for (let [f_name, content] of Object.entries(main)) {
      if (f_name === "round_index") continue
      result.push({
        file_name: `round-${main.round_index}/${f_name}.md`,
        content: content as string,
        created_at: files.find(f => f.file_type === "verifier_output" && f.round.index === main.round_index)?.created_at || String(new Date())
      })
    }
  }
  
  return result
}
