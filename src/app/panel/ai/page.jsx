"use client";

import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import styles from "./Statistika.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const TypingIndicator = () => (
  <div className={styles.typingContainer}>
    <span className={styles.typingDot}></span>
    <span className={styles.typingDot}></span>
    <span className={styles.typingDot}></span>
  </div>
);

const ChartComponent = ({ chartData }) => {
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  try {
    if (!chartData || !chartData.type || !chartData.data) {
      return null;
    }

    const { type, title, data, xKey = "name", yKey = "value" } = chartData;

    switch (type.toLowerCase()) {
      case "bar":
        return (
          <div className={styles.chartWrapper}>
            {title && <h4 className={styles.chartTitle}>{title}</h4>}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={yKey} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case "line":
        return (
          <div className={styles.chartWrapper}>
            {title && <h4 className={styles.chartTitle}>{title}</h4>}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={yKey} stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case "pie":
        return (
          <div className={styles.chartWrapper}>
            {title && <h4 className={styles.chartTitle}>{title}</h4>}
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey={yKey}
                  nameKey={xKey}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return null;
    }
  } catch (error) {
    console.error("Greška pri renderovanju grafikona:", error);
    return <p className={styles.chartError}>Greška pri prikazu grafikona</p>;
  }
};

const parseMessageContent = (text) => {
  const parts = [];
  
  // Ekstrakcija agent_proposal iz originalnog teksta
  const agentRegex = /\[agent_proposal\]([\s\S]*?)\[\/agent_proposal\]/;
  const agentMatch = text.match(agentRegex);
  
  // Ukloni agent proposal iz teksta za prikaz
  let displayText = text.replace(/\[agent_proposal\]([\s\S]*?)\[\/agent_proposal\]/g, '').trim();
  
  // Parsuj grafike iz displayText-a
  const chartRegex = /\[CHART\]([\s\S]*?)\[\/CHART\]/g;
  let lastIndex = 0;
  let chartMatch;

  while ((chartMatch = chartRegex.exec(displayText)) !== null) {
    // Dodaj tekst pre grafikona
    if (chartMatch.index > lastIndex) {
      parts.push({
        type: "text",
        content: displayText.substring(lastIndex, chartMatch.index),
      });
    }

    // Dodaj grafikon
    try {
      const chartData = JSON.parse(chartMatch[1]);
      parts.push({
        type: "chart",
        content: chartData,
      });
    } catch (e) {
      console.error("Greška pri parsiranju grafikona:", e);
      parts.push({
        type: "text",
        content: chartMatch[0],
      });
    }

    lastIndex = chartMatch.index + chartMatch[0].length;
  }

  // Dodaj ostatak teksta
  if (lastIndex < displayText.length) {
    parts.push({
      type: "text",
      content: displayText.substring(lastIndex),
    });
  }

  // Ako nema ničega, vrati ceo displayText
  if (parts.length === 0 && displayText) {
    return [{ type: "text", content: displayText }];
  }

  return parts;
};

// AGENT MAPPER - za filtriranje polja po akciji
const AGENT_MAPPER = {
  "kreiranje": {
    endpoint: "/api/zakazi",
    method: "POST",
    extract: (body) => ({
      id: localStorage.getItem("userId"),
      podaci: {
        datum_rezervacije: body.datum_rezervacije,
        trajanje: body.duzina_termina,
        ime: body.ime,
        email: body.email,
        telefon: body.telefon,
        vreme: body.vreme,
        lokacija: body.lokacija,
        opis: body.opis
      }
    })
  },
  "izmena": {
    endpoint: "/api/zakazi/izmena",
    method: "POST",
    extract: (body) => {
      const [godina, mesec, dan] = body.datum_rezervacije.split("-");

      return {
        id: localStorage.getItem("userId"),
        token: body.token,
        podaci: {
          datum_rezervacije: body.datum_rezervacije,
          trajanje: body.duzina_termina,
          ime: body.ime,
          email: body.email,
          telefon: body.telefon,
          vreme: body.vreme,
          lokacija: body.lokacija,
          token: body.token,
          opis: body.opis,

          // nova polja
          dan: Number(dan),
          mesec: Number(mesec),
          godina: Number(godina),
        },
        stariPodaci: {},
        tipUlaska: 1
      };
    }
  },
  "otkazivanje": {
    endpoint: "/api/zakazi/otkazi",
    method: "PATCH",
    extract: (body) => ({
      token: body.token,
      podaci: {
        dan: body.dan,
        mesec: body.mesec,
        godina: body.godina,
        vreme: body.vreme,
        lokacija: body.lokacija
      },
      tipUlaska: 1
    })
  },
  "potvrdjivanje": {
    endpoint: "/api/potvrdi_termin",
    method: "POST",
    extract: (body) => ({
      termin: {
        token: body.token,
        potvrdio: parseInt(localStorage.getItem("userId"))
      }
    })
  }
};

// Agent komponent
const AgentProposal = ({ proposal, onConfirm, onReject, isExecuting }) => {
  // Provera da li proposal postoji i ima sve potrebne polje
  if (!proposal || !proposal.radnja || !proposal.poruka) {
    console.warn("⚠️  AgentProposal: proposal nema sve potrebne polje", proposal);
    return null;
  }
  
  return (
    <div className={styles.agentProposal}>
      <div className={styles.agentHeader}>
        <span className={styles.agentAction}>🤖 {proposal.radnja.toUpperCase()}</span>
      </div>
      <p className={styles.agentMessage}>{proposal.poruka}</p>
      <div className={styles.agentActions}>
        <button 
          className={styles.agentConfirm}
          onClick={onConfirm}
          disabled={isExecuting}
        >
          {isExecuting ? "⏳" : "✅"} Potvrdi
        </button>
        <button 
          className={styles.agentReject}
          onClick={onReject}
          disabled={isExecuting}
        >
          ❌ Odbij
        </button>
      </div>
    </div>
  );
};

export default function StatistikaPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Zdravo! 👋 Ja sam tvoj asistent. Kako ti mogu da pomognem?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameInputValue, setRenameInputValue] = useState("");
  const [chatToDelete, setChatToDelete] = useState(null);
  const [chatToRename, setChatToRename] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingAgent, setPendingAgent] = useState(null);
  const [executingAgent, setExecutingAgent] = useState(false);
  const [processedAgentMessageId, setProcessedAgentMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Ekstraktuj agent proposal iz poslednje bot poruke - samo ako nije već obrađena
  useEffect(() => {
    if (messages.length > 0 && !pendingAgent) {
      const lastMessage = messages[messages.length - 1];
      // Proveravaj samo ako je nova poruka (različitog ID-a od prethodne obrađene)
      if (lastMessage.sender === "bot" && lastMessage.id !== processedAgentMessageId) {
        const agentRegex = /\[agent_proposal\]([\s\S]*?)\[\/agent_proposal\]/;
        const agentMatch = lastMessage.text.match(agentRegex);
        if (agentMatch) {
          try {
            const agentData = JSON.parse(agentMatch[1]);
            setPendingAgent(agentData);
            setProcessedAgentMessageId(lastMessage.id);
          } catch (e) {
            console.error("Greška pri parsiranju agenta iz poruke:", e);
          }
        }
      }
    }
  }, [messages, pendingAgent, processedAgentMessageId]);

  // Zatvori meni kada se klikne negde drugde
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('[data-menu-button]') && !e.target.closest('[data-menu-content]')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Učitavanje liste chatova pri montiranju komponente
  useEffect(() => {
    const loadChatsList = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const userId = localStorage.getItem("userId");

        if (!authToken || !userId) return;

        const response = await fetch(
          `http://127.0.0.1:5000/api/chats?userId=${userId}&authToken=${authToken}`
        );

        if (response.ok) {
          const data = await response.json();
          setChats(data.chats || []);
          
          // Ako postoji chat, učitaj prvi
          if (data.chats.length > 0 && !currentChatId) {
            const firstChatId = data.chats[0].chat_id;
            loadChat(firstChatId);
          }
        }
      } catch (error) {
        console.error("Greška pri učitavanju chatova:", error);
      }
    };

    loadChatsList();
  }, []);

  const loadChat = async (chatId) => {
    try {
      const authToken = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");

      if (!authToken || !userId) return;

      setChatLoading(true);
      const response = await fetch(
        `http://127.0.0.1:5000/api/chat/${chatId}?userId=${userId}&authToken=${authToken}`
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.chat.messages);
        setCurrentChatId(chatId);
        setPendingAgent(null);  // Resetuj pending agent
        setProcessedAgentMessageId(null);  // Resetuj processedAgentMessageId
      } else if (response.status === 403) {
        alert("Nemate dozvolu da pristupite ovom chatu");
      }
    } catch (error) {
      console.error("Greška pri učitavanju chata:", error);
      alert(`Greška pri učitavanju chata: ${error.message}`);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCreateNewChat = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");

      if (!authToken || !userId) {
        alert("Greška: Nedostaju autentifikacijski podaci");
        return;
      }

      const response = await fetch("http://127.0.0.1:5000/api/chat/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authToken,
          userId,
          title: "Nova konverzacija",
        }),
      });

      if (response.ok) {
        const newChat = await response.json();
        
        // Dodaj novi chat u listu
        setChats((prev) => [
          {
            chat_id: newChat.chat_id,
            title: newChat.title,
            created_at: newChat.created_at,
            message_count: 1,
          },
          ...prev,
        ]);

        // Učitaj novi chat
        await loadChat(newChat.chat_id);
        
        // RESETUJ pendingAgent
        setPendingAgent(null);
        setProcessedAgentMessageId(null);
        
        // Resetuj poruke na početnu
        setMessages([
          {
            id: 1,
            text: "Zdravo! 👋 Ja sam tvoj asistent. Kako ti mogu da pomognem?",
            sender: "bot",
          },
        ]);
      } else {
        alert("Greška pri kreiranju chata");
      }
    } catch (error) {
      console.error("Greška pri kreiranju chata:", error);
      alert(`Greška pri kreiranju chata: ${error.message}`);
    }
  };

  const handleShowMenu = (e, chatId) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === chatId ? null : chatId);
  };

  const handleDeleteClick = (e, chat) => {
    e.stopPropagation();
    setChatToDelete(chat);
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const handleRenameClick = (e, chat) => {
    e.stopPropagation();
    setChatToRename(chat);
    setRenameInputValue(chat.title);
    setRenameModalOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!chatToDelete) return;

    try {
      const authToken = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");

      if (!authToken || !userId) return;

      const response = await fetch(
        `http://127.0.0.1:5000/api/chat/${chatToDelete.chat_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            authToken,
            userId,
          }),
        }
      );

      if (response.ok) {
        setChats((prev) => prev.filter((c) => c.chat_id !== chatToDelete.chat_id));
        if (currentChatId === chatToDelete.chat_id) {
          setCurrentChatId(null);
          setMessages([
            {
              id: 1,
              text: "Zdravo! 👋 Ja sam tvoj asistent. Kako ti mogu da pomognem?",
              sender: "bot",
            },
          ]);
        }
        setDeleteModalOpen(false);
        setChatToDelete(null);
      }
    } catch (error) {
      console.error("Greška pri brisanju chata:", error);
    }
  };

  const handleConfirmRename = async () => {
    if (!chatToRename || !renameInputValue.trim()) return;

    try {
      const authToken = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");

      if (!authToken || !userId) return;

      const response = await fetch(
        `http://127.0.0.1:5000/api/chat/${chatToRename.chat_id}/rename`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            authToken,
            userId,
            title: renameInputValue,
          }),
        }
      );

      if (response.ok) {
        setChats((prev) =>
          prev.map((c) =>
            c.chat_id === chatToRename.chat_id
              ? { ...c, title: renameInputValue }
              : c
          )
        );
        setRenameModalOpen(false);
        setChatToRename(null);
        setRenameInputValue("");
      }
    } catch (error) {
      console.error("Greška pri preimenovanju chata:", error);
    }
  };

  // Focus input kada korisnik počne da piše
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ako je neki modal otvoren, ne fokusiraj input
      if (deleteModalOpen || renameModalOpen) return;

      // Proveri da li je korisnik već fokusiran na input
      if (document.activeElement === inputRef.current) return;

      // Ako je meta/ctrl/shift/alt, preskoči
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Ako je Escape, ne fokusiraj
      if (e.key === "Escape") return;

      // Fokusiraj input
      inputRef.current?.focus();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteModalOpen, renameModalOpen]);

  // Agent akcije
  const handleConfirmAgent = async () => {
    if (!pendingAgent) return;

    try {
      setExecutingAgent(true);
      const authToken = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");
      
      if (!authToken) {
        alert("Greška: Nema autentifikacije");
        return;
      }

      const mapper = AGENT_MAPPER[pendingAgent.radnja];
      if (!mapper) {
        alert("Nepoznata akcija");
        return;
      }

      const payload = mapper.extract(pendingAgent.body);
      payload.authToken = authToken;

      const response = await fetch(
        `http://127.0.0.1:5000${mapper.endpoint}`,
        {
          method: mapper.method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      const lastMessage = messages[messages.length - 1];

      if (response.ok) {
        // Zameni [agent_proposal] sa statusom u originalnoj poruci
        const updatedText = lastMessage.text.replace(
          /\[agent_proposal\]([\s\S]*?)\[\/agent_proposal\]/,
          `✅ **Akcija "${pendingAgent.radnja}" je uspešno izvršena!**`
        );
        
        // Ažuriraj poruku u stanju
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { ...lastMessage, text: updatedText }
        ]);
        
        // Sačuvaj ažuriranu poruku u bazi
        try {
          await fetch(`http://127.0.0.1:5000/api/chat/${currentChatId}/message`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              authToken,
              userId,
              message: updatedText,
              sender: "bot",
            }),
          });
        } catch (error) {
          console.error("Greška pri čuvanju poruke:", error);
        }
      } else {
        // Zameni [agent_proposal] sa greškom
        const updatedText = lastMessage.text.replace(
          /\[agent_proposal\]([\s\S]*?)\[\/agent_proposal\]/,
          `❌ **Greška pri izvršavanju akcije:** ${result.message || result.error || "Nepoznata greška"}`
        );
        
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { ...lastMessage, text: updatedText }
        ]);
        
        // Sačuvaj ažuriranu poruku u bazi
        try {
          await fetch(`http://127.0.0.1:5000/api/chat/${currentChatId}/message`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              authToken,
              userId,
              message: updatedText,
              sender: "bot",
            }),
          });
        } catch (error) {
          console.error("Greška pri čuvanju poruke:", error);
        }
      }

      setPendingAgent(null);
      setProcessedAgentMessageId(null);
    } catch (error) {
      console.error("Greška pri izvršavanju akcije:", error);
      const lastMessage = messages[messages.length - 1];
      
      const updatedText = lastMessage.text.replace(
        /\[agent_proposal\]([\s\S]*?)\[\/agent_proposal\]/,
        `❌ **Greška:** ${error.message}`
      );
      
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { ...lastMessage, text: updatedText }
      ]);
      
      setPendingAgent(null);
      setProcessedAgentMessageId(null);
    } finally {
      setExecutingAgent(false);
    }
  };

  const handleRejectAgent = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");
      const lastMessage = messages[messages.length - 1];
      
      // Zameni [agent_proposal] sa status porukom
      const updatedText = lastMessage.text.replace(
        /\[agent_proposal\]([\s\S]*?)\[\/agent_proposal\]/,
        `❌ **Akcija je odbijena od strane korisnika.**`
      );
      
      // Ažuriraj poruku u stanju
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { ...lastMessage, text: updatedText }
      ]);
      
      // Sačuvaj ažuriranu poruku u bazi
      try {
        await fetch(`http://127.0.0.1:5000/api/chat/${currentChatId}/message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            authToken,
            userId,
            message: updatedText,
            sender: "bot",
          }),
        });
      } catch (error) {
        console.error("Greška pri čuvanju poruke:", error);
      }
      
      setPendingAgent(null);
      setProcessedAgentMessageId(null);
    } catch (error) {
      console.error("Greška pri odbijanju akcije:", error);
      setPendingAgent(null);
      setProcessedAgentMessageId(null);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Dohvati token i userId
    const authToken = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!authToken || !userId) {
      alert("Greška: Nedostaju autentifikacijski podaci. Molimo prijavite se ponovo.");
      return;
    }

    // Ako nema aktivnog chata, kreiraj novi
    let chatId = currentChatId;
    if (!chatId) {
      try {
        const createResponse = await fetch("http://127.0.0.1:5000/api/chat/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            authToken,
            userId,
            title: "Nova konverzacija",
          }),
        });

        if (createResponse.ok) {
          const newChat = await createResponse.json();
          chatId = newChat.chat_id;
          setCurrentChatId(chatId);
          
          // Dodaj u listu chatova
          setChats((prev) => [
            {
              chat_id: newChat.chat_id,
              title: newChat.title,
              created_at: newChat.created_at,
              message_count: 1,
            },
            ...prev,
          ]);
        } else {
          alert("Greška pri kreiranju chata");
          return;
        }
      } catch (error) {
        console.error("Greška pri kreiranju chata:", error);
        return;
      }
    }

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
    };

    const userInput = input;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Čuva user poruku u bazi
    try {
      await fetch(`http://127.0.0.1:5000/api/chat/${chatId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authToken,
          userId,
          message: userInput,
          sender: "user",
        }),
      });
    } catch (error) {
      console.error("Greška pri čuvanju user poruke:", error);
    }

    // Delay pre nego što bot počne da piše
    setTimeout(async () => {
      setIsTyping(true);

      // Pripremi poruke za API - isključi početnu bot poruku
      const conversationHistory = messages
        .filter((m) => m.id !== 1)
        .concat([userMessage])
        .map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        }));

      // Pozovi API
      const fetchAIResponse = async () => {
        try {
          const response = await fetch("http://127.0.0.1:5000/api/askAI", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              authToken,
              userId,
              pitanje: userInput,
              poruke: conversationHistory,
            }),
          });

          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            console.error("Server nije vratio JSON:", response.status, response.statusText);
            throw new Error(`Server greška: ${response.status} ${response.statusText}`);
          }

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Greška pri komunikaciji sa serverom");
          }

          const data = await response.json();
          return data.odgovor;

        } catch (error) {
          console.error("Greška pri pozivu AI:", error);
          return `Greška: ${error.message}. Molimo pokušajte ponovo.`;
        }
      };

      // Čekaj odgovor od API-ja
      const aiResponse = await fetchAIResponse();

      // Tek kada dođe odgovor, ugasi animaciju
      setIsTyping(false);

      const botMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMessage]);

      // Čuva bot poruku u bazi
      try {
        await fetch(`http://127.0.0.1:5000/api/chat/${chatId}/message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            authToken,
            userId,
            message: aiResponse,
            sender: "bot",
          }),
        });
      } catch (error) {
        console.error("Greška pri čuvanju bot poruke:", error);
      }

      setLoading(false);
    }, 800);
  };


  return (
    <div className={styles.container}>
      {/* Overlay za mobilne */}
      {sidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div style={{ display: "flex", gap: "16px", height: "100%", width: "100%" }}>
        {/* Glavni chat deo */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div className={styles.header}>
            <h1>AI Asistent</h1>
            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
              <i
                className="fa-solid fa-comments"
                style={{ fontSize: "24px", color: "#3b82f6" }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title="Prikaži/Sakrij čatove"
              ></i>
              <a href="/panel/ai/info">
                <i 
                  className="fa-solid fa-gear"
                  style={{ fontSize: "24px", color: "#3b82f6" }}
                  title="Prikaži informacije o AI."
                ></i>
              </a>
            </div>
          </div>

          <div className={styles.chatContainer}>
            <div className={styles.messagesArea}>
              {messages.length === 0 ? (
                <div className={styles.emptyState}>
                  <i className="fa-solid fa-comments"></i>
                  <p>Nema poruka. Počni razgovor sa asistentom!</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`${styles.message} ${styles[message.sender]}`}
                    >
                      <div
                        className={`${styles.messageBubble} ${styles.textReveal}`}
                      >
                        {message.sender === "bot" ? (
                          <div className={styles.markdown}>
                            {parseMessageContent(message.text).map((part, idx) =>
                              part.type === "text" ? (
                                <ReactMarkdown key={idx}>
                                  {part.content}
                                </ReactMarkdown>
                              ) : part.type === "chart" ? (
                                <ChartComponent key={idx} chartData={part.content} />
                              ) : null
                            )}
                            {pendingAgent && message.id === messages[messages.length - 1].id && (
                              <div style={{ marginTop: "16px" }}>
                                <AgentProposal 
                                  proposal={pendingAgent}
                                  onConfirm={handleConfirmAgent}
                                  onReject={handleRejectAgent}
                                  isExecuting={executingAgent}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          message.text
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className={`${styles.message} ${styles.bot}`}>
                      <div className={styles.messageBubble}>
                        <TypingIndicator />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <form className={styles.inputArea} onSubmit={handleSendMessage}>
              <input
                ref={inputRef}
                type="text"
                className={styles.input}
                placeholder="Unesite vašu poruku..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className={styles.sendBtn}
                disabled={loading || !input.trim()}
              >
                <i className="fa-solid fa-paper-plane"></i>
                Pošalji
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar sa listom chatova */}
        <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebaropen : ''}`}>
          {/* Header */}
          <div style={{ padding: "10px", borderBottom: "1px solid #e5e7eb", display: 'flex',
              flexDirection:'column', alignItems:'center', gap:'8px'
           }}>
            <h2>AI Asistent</h2>
            <button
              onClick={handleCreateNewChat}
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#2563eb")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#3b82f6")}
            >
              <i className="fa-solid fa-plus" style={{ marginRight: "6px" }}></i>
              Novi chat
            </button>
          </div>

          {/* Lista chatova */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {chatLoading ? (
              <div style={{ padding: "16px", textAlign: "center", color: "#9ca3af" }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "8px" }}></i>
                Učitavanje...
              </div>
            ) : chats.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
                Nema chatova. Kreiraj novi!
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.chat_id}
                  onClick={() => {
                    setOpenMenuId(null);
                    loadChat(chat.chat_id);
                    setSidebarOpen(false);
                  }}
                  style={{
                    padding: "12px",
                    marginBottom: "6px",
                    backgroundColor:
                      currentChatId === chat.chat_id ? "#e0e7ff" : "transparent",
                    border:
                      currentChatId === chat.chat_id
                        ? "1px solid #3b82f6"
                        : "1px solid #e5e7eb",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => {
                    if (currentChatId !== chat.chat_id) {
                      e.currentTarget.style.backgroundColor = "#f3f4f6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentChatId !== chat.chat_id) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: "600",
                        fontSize: "14px",
                        color: currentChatId === chat.chat_id ? "#1f2937" : "#4b5563",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {chat.title}
                    </div>
                    
                  </div>
                  <div style={{ position: "relative", marginLeft: "8px" }} data-menu-content>
                    <button
                      onClick={(e) => handleShowMenu(e, chat.chat_id)}
                      data-menu-button
                      style={{
                        background: "none",
                        border: "none",
                        color: "#6b7280",
                        cursor: "pointer",
                        fontSize: "18px",
                        padding: "4px 8px",
                        transition: "color 0.2s",
                      }}
                      title="Više opcija"
                    >
                      <i className="fa-solid fa-ellipsis-vertical" style={{ pointerEvents: "none" }}></i>
                    </button>
                    {openMenuId === chat.chat_id && (
                      <div
                        data-menu-content
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: 0,
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          zIndex: 10,
                          minWidth: "150px",
                          marginTop: "4px",
                        }}
                      >
                        <button
                          onClick={(e) => handleRenameClick(e, chat)}
                          style={{
                            width: "100%",
                            padding: "10px 16px",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            textAlign: "left",
                            fontSize: "14px",
                            color: "#374151",
                            borderBottom: "1px solid #e5e7eb",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = "#f9fafb")}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                        >
                          <i className="fa-solid fa-pen" style={{ marginRight: "8px" }}></i>
                          Preimenuj
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, chat)}
                          style={{
                            width: "100%",
                            padding: "10px 16px",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            textAlign: "left",
                            fontSize: "14px",
                            color: "#ef4444",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = "#fef2f2")}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                        >
                          <i className="fa-solid fa-trash-can" style={{ marginRight: "8px" }}></i>
                          Obriši
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setDeleteModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#1f2937",
                marginBottom: "12px",
              }}
            >
              <i
                className="fa-solid fa-trash-can"
                style={{ marginRight: "12px", color: "#ef4444" }}
              ></i>
              Obriši chat
            </div>
            <p
              style={{
                color: "#6b7280",
                lineHeight: "1.6",
                marginBottom: "24px",
                fontSize: "15px",
              }}
            >
              Sigurni ste da želite trajno obrisati chat "<strong>{chatToDelete?.title}</strong>"?
              Ova akcija se ne može poništiti.
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "white",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
              >
                Odustani
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  backgroundColor: "#ef4444",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "white",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
              >
                Obriši
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setRenameModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#1f2937",
                marginBottom: "12px",
              }}
            >
              <i
                className="fa-solid fa-pen"
                style={{ marginRight: "12px", color: "#3b82f6" }}
              ></i>
              Preimenuj chat
            </div>
            <p
              style={{
                color: "#6b7280",
                lineHeight: "1.6",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              Unesite novi naziv ili vrati stari:
            </p>
            <input
              type="text"
              value={renameInputValue}
              onChange={(e) => setRenameInputValue(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                marginBottom: "24px",
                boxSizing: "border-box",
              }}
              placeholder="Novi naziv..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmRename();
                if (e.key === "Escape") setRenameModalOpen(false);
              }}
            />
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setRenameModalOpen(false)}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "white",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
              >
                Odustani
              </button>
              <button
                onClick={handleConfirmRename}
                disabled={!renameInputValue.trim()}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  backgroundColor: renameInputValue.trim() ? "#3b82f6" : "#d1d5db",
                  borderRadius: "6px",
                  cursor: renameInputValue.trim() ? "pointer" : "not-allowed",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "white",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (renameInputValue.trim()) {
                    e.target.style.backgroundColor = "#2563eb";
                  }
                }}
                onMouseLeave={(e) => {
                  if (renameInputValue.trim()) {
                    e.target.style.backgroundColor = "#3b82f6";
                  }
                }}
              >
                Potvrdi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
