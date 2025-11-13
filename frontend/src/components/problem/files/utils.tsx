export interface File {
  id: number,
  problem_id: number,
  round: number,
  file_name: string,
  file_type: string,
  content: string,
  created_at: string,
  metadata?: object,
}

export interface ProblemFiles {
  task: File,
  results: {
    notes: File,
    proofs: File,
    output: File, // aka Main Results
  },
  rounds: {
    round: number,
    provers?: File[][],
    verifier?: File[],
    summarizer?: File[],
    metadata?: any[],
  }[],
}

// TODO: I could migrate this logic to backend so that we just get the data ready to go   
export function format_raw_files_data(files: File[]) {
  let file_list: ProblemFiles = {
    task: files.filter(file => file.file_type === "task")[0],
    results: {
      notes: files.filter(file => file.file_type === "notes")[0],
      proofs: files.filter(file => file.file_type === "proofs")[0],
      output: files.filter(file => file.file_type === "output")[0],
    },
    rounds: []
  }
  let highest_round = files.reduce((a, curr) => curr.round > a ? curr.round : a, 0)
  for (let round = 1; round <= highest_round; round++) {
    let curr_round_files = files.filter(file => file.round === round)
    // console.log(round, curr_round_files.map(file => file.file_name))

    let metadata = curr_round_files.filter(file => file.file_type === "round_meta" || file.file_type === "response_ids")
    let verifier = curr_round_files.filter(file => file.file_type.startsWith("verifier"))
    let summarizer = curr_round_files.filter(file => file.file_type.startsWith("summarizer"))

    let provers_raw = curr_round_files.filter(file => file.file_type.startsWith("prover"))

    let prover_count
    if (provers_raw.length === 0) prover_count = 0
    else prover_count = Math.max(...provers_raw.map(file => parseInt(file.file_name.match(/\d/g)?.join("") || "")))
    
    let provers = []
    for (let i = 1; i <= prover_count; i++) {
      let i_th_prover_files = curr_round_files.filter(file => parseInt(file.file_name.match(/\d/g)?.join("") || "") === i)
      provers.push(i_th_prover_files)
    }

    file_list["rounds"].push({
      round,
      metadata,
      verifier,
      summarizer,
      provers,
    })
  }
  return file_list
}