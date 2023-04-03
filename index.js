
const params = (attendees, media_pipeline_id) => {
  const n = attendees.length;
  const values = []
  const query = "INSERT INTO media_pipelines (media_pipeline_id, attendee_id) VALUES ";
  let a = "";
  let k = 1;
  for (let i = 0; i < n; i++) {
    let st = `($${k}, $${k + 1})`;
    if (i != n - 1) {
      st = st + ", ";
    }
    k = k + 2;
    a = a + st;
    values.push(media_pipeline_id, attendees[i])
  }
  return {
    query : query+a,
    values: values
  }
};
console.log(params(["id1", "id2","id3"], "mediaId"))