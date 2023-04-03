const { Client } = require("pg");

const getValue = (value) =>{
  return value<10 ? `0${value}`: value;
}
const getDateTime = ()=>{
  const date = new Date();
  return{
    date: `${date.getFullYear()}-${getValue(date.getMonth()+1)}-${getValue(date.getDate())}`,
    time: `${getValue(date.getHours())}:${getValue(date.getMinutes())}:${getValue(date.getSeconds())}+05:30`
  }
}

exports.handler = async (event) => {
  // TODO implement
  const client = new Client({
    host: process.env.HOST,
    port: process.env.PORT, // or whatever port your PostgreSQL database uses
    database: process.env.DATABASE,
    user: process.env.USER,
    password: process.env.PASSWORD,
  });
    await client.connect();
  try {
    if (
      event["detail-type"] == "Chime Meeting State Change" &&
      event?.detail?.eventType == "chime:MeetingEnded"
    ) {
      const meetingId = event?.detail?.meetingId;
      // const query = "DELETE FROM meetings WHERE meetingId = $1";
      const query = "SELECT * FROM meetings WHERE meetingId = $1";
      const values = [meetingId];
      const result = await client.query(query, values);
      console.log(result);
      if(result.rows[0].status == 'Ended'){
        await client.end();
        return null;
      }else{
          const update_query= "UPDATE meetings SET ended_time = $1 , ended_date=$2, status=$3 WHERE meetingId = $4";
          const result2 = await client.query(update_query, [getDateTime().time, getDateTime().date, 'Ended', meetingId ])
          console.log(result2)
          await client.end();
      }

    }
    else if(
      event["detail-type"] == "Chime Meeting State Change" &&
      event?.detail?.eventType == "chime:AttendeeJoined"
    ){ 
      await client.connect();
      const query = "INSERT INTO attendees (attendee_id, meeting_id, username) VALUES ($1, $2, $3)";
      const values = [event?.detail?.attendeeId, event?.detail?.meetingId, event?.detail?.externalUserId];
      const result = await client.query(query, values);
      console.log(result);
      await client.end();
    }
    else{
        console.log("null")
    }
  } catch (err) {
    console.log(err)
  }
  finally{
    await client.end();
    console.log("disconnected")
  }
};
