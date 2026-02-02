import { useQuery } from "@tanstack/react-query"
import { styled } from "@linaria/react"

import FileContentViewer from "./ContentViewer"
import { get_file_by_id } from "../../../api/problems"


interface Props {
  file_id: string
}

export default function FileViewer({ file_id }: Props) {
  const { data: file, isError, isPending } = useQuery({
    queryKey: ["viewer-get_file_by_id", file_id],
    queryFn: () => get_file_by_id(file_id)
  })

  if (isPending) return (
    <FileStatus>
      <div className="spinner"></div>
      <p>Loading file...</p>
    </FileStatus>
  )

  if (isError) return (
    <FileStatus>
      <p>Failed to get file with id: {file_id}</p>
    </FileStatus>
  )

  if (!file) return (
    <FileStatus>
      <p>File with this id doesn't exist: {file_id}</p>
    </FileStatus>
  )

  return (
    <FileContentViewer file_id={file_id}
      name={file.file_name}
      content={file.content}
      model_id={file.model_id ?? undefined}
      cost={file.usage?.cost}
    />
  )
}

const FileStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column;
  width: 100%;
  gap: 1rem;
`
