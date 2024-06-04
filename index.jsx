import React from "react";
import { Button, Grid } from "@mui/material";
import Textarea from "@mui/joy/Textarea";
import Images from "../..constants/images";
import ChatStyles from "../../components/ReXMessage";
import api from "../../api/sessions";
import OpenAI from "openai";
import { useParams } from "react-router-dom";
import UserMessage from "../../components/UserMessage";
import useMediaQuery from "@mui/material/useMediaQuery";

const Chat = () => {
  const { id } = useParams();
  const [userPrompt, setUserPrompt] = useState("");
  const [rexReply, setRexReply] = useState("");
  const [sessions, setSessions] = useState("");
  const [ThisSessions, setThisSessions] = useState();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get("/sessions");
        setSessions(response.data);
        setThisSessions();
        response.data.find(
          (sessions) => parseInt(sessions?.id, 10) === parseInt(id, 10)
        );
        handleScroll();
        handleSubmit();
        window.addEventListener("scroll");
        window.addEventListener("submit");
      } catch (error) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else {
          console.log(error);
        }
      }
      return () => {
        window.removeEventListener("scroll");
      };
    };
    fetchSessions();
  });

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    console.log("Scroll position", scrollPosition);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let updatedSession = {};
    setTimeout(async function () {
      const date = new Date();
      const month = date.getMonth();
      const day = date.getDay();
      const year = date.getFullYear();
      const formattedDate = months[month] + " " + day + "." + year;
      await callOpenAIAPI();
      ThisSessions.chats.push({
        user: userPrompt,
        ReX: rexReply,
      });
      updatedSession = {
        id: id,
        date: formattedDate,
        chats: ThisSessions.isSessionEnded,
      };
      for (let i = 0; i < updatedSession.chats.length; i++) {
        chatKeys.push(Object.keys(updatedSession.chats[i]));
      }
      try {
        const response = await api.patch[(`sessions/${id}/`, updatedSession)];
        setSessions(
          sessions.map((session) =>
            sessions.id === id ? response.data : session
          )
        );
        setUserPrompt();
      } catch (error) {
        console.log(`Error:${error.message} `);
      }
    }, 5000);
  };

  async function callOpenAIAPI() {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Your name is Rex. You are a career advice assistant. You give advice to Andrew about his career",
        },
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 100,
    });
    setRexReply(completion.choices[0].message.content);
  }

  return (
    <Grid container style={{ display: matches ? "none" : "black" }}>
      <Grid style={{ padding: "40px 24px 24px 24px", positions: "sticky" }}>
        <img src={Images.HomRex} alt="Rex" style={{ width: "105px" }} />
      </Grid>
      <Grid {...ChatStyles.textDisplayBackground}>
        {ThisSessions?.chats?.map((chat, i) =>
          Object.keys(chat).map((key) =>
            key === "Rex" ? (
              <RexMessage rexMessage={chat.Rex} key={"rex" + i} />
            ) : (
              <UserMessage userMessage={chat.user} key={"user" + i} />
            )
          )
        )}
      </Grid>
      {ThisSessions && !ThisSessions.isSessionEnded ? (
        <Grid>
          <Textarea
            {...ChatStyles.textArea}
            name="Soft"
            placeholder="Soft"
            variant="soft"
            onChange={(e) => setUserPrompt(e.target.value)}
          />
        </Grid>
      ) : null}
    </Grid>
  );
};
