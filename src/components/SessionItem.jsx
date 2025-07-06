import React, { useState } from "react";
import ExpandableContent from "./ExpandableContent";
import { FaPencilAlt, FaSave, FaTrashAlt, FaWindowRestore, FaWindowMaximize, FaChevronDown, FaChevronRight } from "react-icons/fa";

export default function SessionItem({ session, onOpenSameWindow, onOpenNewWindow, onDelete, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(session.name);
  const [tabs, setTabs] = useState(session.tabs);

  const toggleExpand = () => setExpanded(!expanded);

  const saveName = () => {
    onUpdate({ ...session, name });
    setEditingName(false);
  };

  // const saveTabs = () => {
  //   onUpdate({ ...session, tabs });
  //   // setExpanded(false);
  // };

  // const addTab = () => {
  //   setTabs([...tabs, { url: "", title: "" }]);
  // };

  const updateTab = (index, field, value) => {
    const newTabs = [...tabs];
    newTabs[index][field] = value;
    setTabs(newTabs);
  };

  const removeTab = (index) => {
    setTabs(tabs.filter((_, i) => i !== index));
  };

  return (
    <div className="border rounded-lg shadow-md p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {editingName ? (
            <input
              className="border p-1 rounded focus:outline-none focus:ring focus:ring-blue-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          ) : (
            <span className="font-medium text-gray-800 dark:text-gray-100">{name}</span>
          )}
        </div>
        <div className="flex space-x-1">
          {editingName ? (
            <button
              className="text-green-500 text-xs hover:bg-green-100 dark:hover:bg-green-700 p-2 rounded-full"
              onClick={saveName}
            >
              <FaSave />
            </button>
          ) : (
            <>
              <button
                className="text-blue-500 text-xs hover:bg-blue-100 dark:hover:bg-blue-700 p-2 rounded-full"
                onClick={() => setEditingName(true)}
                title="Edit Session Name"
              >
                <FaPencilAlt />
              </button>
              <button
                className="text-gray-500 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full"
                onClick={() => onOpenSameWindow(tabs)}
                title="Open in Same Window"
              >
                <FaWindowRestore />
              </button>
              <button
                className="text-gray-500 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full"
                onClick={() => onOpenNewWindow(tabs)}
                title="Open in New Window"
              >
                <FaWindowMaximize />
              </button>
              <button
                className="text-red-500 text-xs hover:bg-red-100 dark:hover:bg-red-700 p-2 rounded-full"
                onClick={onDelete}
                title="Delete Session"
              >
                <FaTrashAlt />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex items-center space-x-2 mt-4 cursor-pointer" onClick={toggleExpand} style={{ cursor: "pointer" }}>
        {/* Toggle icon */}
        <span className="text-medium font-bold text-gray-700 dark:text-gray-300">
          {expanded ? <FaChevronDown /> : <FaChevronRight />}
        </span>
        <span className="font-medium text-gray-800 dark:text-gray-100">Session Tabs</span>
      </div>
      <ExpandableContent
        expanded={expanded}
        tabs={tabs}
        updateTab={updateTab}
        removeTab={removeTab}
      />
    </div>
  );
}
