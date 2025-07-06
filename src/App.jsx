/* global chrome */
import React, { useEffect, useState } from "react";
import SessionItem from "./components/SessionItem";
import { FaTimes, FaSort } from "react-icons/fa";

const DEFAULT_CATEGORIES = ["Work", "Personal", "Research", "Other"];

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [sessionName, setSessionName] = useState("");
  const [currentTabs, setCurrentTabs] = useState([]);
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [categories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortType, setSortType] = useState('recent');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  useEffect(() => {
    loadSessions();
    loadCurrentTabs();
  }, []);

  const loadSessions = async () => {
    const data = await chrome.storage.local.get(["sessions"]);
    setSessions(data.sessions || []);
  };

  const loadCurrentTabs = async () => {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    setCurrentTabs(tabs);
  };

  const closeTab = async (tabId) => {
    await chrome.tabs.remove(tabId);
    loadCurrentTabs();
  };

  const saveSession = async () => {
    if (!sessionName.trim()) return;
    const tabs = await chrome.tabs.query({});
    const tabData = tabs.map(tab => ({ url: tab.url, title: tab.title }));
    const now = Date.now();
    const session = {
      id: "session-" + now,
      name: sessionName,
      tabs: tabData,
      category: category,
      createdAt: now,
      lastUsed: now
    };
    const newSessions = [...sessions, session];
    await chrome.storage.local.set({ sessions: newSessions });
    setSessionName("");
    setSessions(newSessions);
  };

  const updateSession = async (updatedSession) => {
    const newSessions = sessions.map(s => s.id === updatedSession.id ? updatedSession : s);
    await chrome.storage.local.set({ sessions: newSessions });
    setSessions(newSessions);
  };

  const handleOpenSession = async (tabs, session, newWindow) => {
    if (newWindow) {
      openSessionNewWindow(tabs);
    } else {
      await openSessionSameWindow(tabs);
    }
    const now = Date.now();
    const updatedSession = { ...session, lastUsed: now };
    await updateSession(updatedSession);
  };

  const deleteSession = async (id) => {
    const newSessions = sessions.filter(s => s.id !== id);
    await chrome.storage.local.set({ sessions: newSessions });
    setSessions(newSessions);
  };

  const openSessionSameWindow = async (tabs) => {
    const [currentWindow] = await chrome.windows.getAll({
      populate: false,
      windowTypes: ["normal"]
    });
    for (const tab of tabs) {
      await chrome.tabs.create({
        windowId: currentWindow.id,
        url: tab.url,
        active: false
      });
    }
  };

  const openSessionNewWindow = (tabs) => {
    chrome.windows.create({
      url: tabs.map(t => t.url)
    });
  };

  // Filter sessions by selected category
  const filteredSessions = selectedCategory === 'All'
    ? sessions
    : sessions.filter(session => session.category === selectedCategory);
  
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (sortType === 'date') {
      return b.createdAt - a.createdAt;
    } else if (sortType === 'recent') {
      return b.lastUsed - a.lastUsed;
    }
    return 0;
  });

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-semibold mb-4 italic">Tabby <span className="text-base text-slate-600 not-italic">Ultimate session manager</span></h1>
      <div className="flex space-x-4 mb-4 items-center relative">
        {['All', ...categories].map(cat => (
          <span
            key={cat}
            className={
              `relative cursor-pointer text-xs font-bold transition-colors duration-150 ` +
              (selectedCategory === cat
                ? 'text-blue-500'
                : 'text-gray-700 dark:text-gray-200 hover:text-blue-500')
            }
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
            <span
              className={
                `block absolute left-0 right-0 h-0.5 rounded-full ` +
                (selectedCategory === cat
                  ? 'bg-blue-500 scale-x-100'
                  : 'bg-blue-500 scale-x-0 group-hover:scale-x-100')
              }
              style={{
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transformOrigin: 'left'
              }}
            />
          </span>
        ))}
        {/* Sort Icon and Dropdown */}
        <div className="relative">
          <span
            className="ml-2 cursor-pointer text-gray-700 dark:text-gray-200 hover:text-blue-500 flex items-center"
            onClick={() => setSortDropdownOpen(v => !v)}
            title="Sort Sessions"
          >
            <FaSort size={18} />
          </span>
          {sortDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
              <div
                className={`px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-700 ${sortType === 'recent' ? 'text-blue-500 font-semibold' : ''}`}
                onClick={() => { setSortType('recent'); setSortDropdownOpen(false); }}
              >
                Most Recent Usage
              </div>
              <div
                className={`px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-700 ${sortType === 'date' ? 'text-blue-500 font-semibold' : ''}`}
                onClick={() => { setSortType('date'); setSortDropdownOpen(false); }}
              >
                Date Added
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4 sessions-list">
        <style>{`
          .sessions-list::-webkit-scrollbar {
            height: 8px;
            width: 4px;
          }
          .sessions-list::-webkit-scrollbar-thumb {
            background:rgb(170, 170, 170);
            border-radius: 4px;
          }
          .sessions-list::-webkit-scrollbar-track {
            background: transparent;
          }
        `}</style>
        {sortedSessions.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">{sessions.length === 0 ? "No sessions found" : "No sessions found in this category."}</p>
        )}
        {sortedSessions.map(session => (
          <div
            key={session.id}
            className="border rounded-lg shadow-md p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <SessionItem
              session={session}
              onOpenSameWindow={() => handleOpenSession(session.tabs, session, false)}
              onOpenNewWindow={() => handleOpenSession(session.tabs, session, true)}
              onDelete={() => deleteSession(session.id)}
              onUpdate={updateSession}
            />
          </div>
        ))}
      </div>
      <div className="mb-4 mt-6">
        <div className="font-semibold mb-2">Current Session</div>
        <div className="flex overflow-x-auto space-x-4 py-2">
          {currentTabs.map(tab => (
            <div key={tab.id} className="relative flex flex-col items-center group">
              <img
                src={`chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(tab.url)}&size=32`}
                alt="Tab Icon"
                className="w-[20px] h-[20px] rounded"
              />
              <button
                className="absolute -top-2 right-0 w-[10px] h-[10px] bg-red-500 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 text-xs z-10"
                onClick={() => closeTab(tab.id)}
                title="Close Tab"
                style={{ top: '-5px', right: '-5px', zIndex: 10 }}
              >
                <FaTimes size={'0.5rem'} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex mb-2 items-center">
        <input
          className="border p-2 flex-1 mr-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded"
          type="text"
          placeholder="Session name"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
        />
        <select
          className="border p-2 mr-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={saveSession}
        >
          Save
        </button>
      </div>
    </div>
  );
}
