/* global chrome */
import React from "react";
import { FaTimes } from "react-icons/fa";

export default function ExpandableContent({ expanded, tabs, removeTab }) {
    if (!expanded) {
        return null;
    }
    function faviconURL(u) {
        const url = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(u)}&size=32`
        return url.toString();
    }

    return (
        <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
            <div className="flex flex-nowrap justify-start gap-4 overflow-x-auto tabs-list">
                <style>{`
                .tabs-list::-webkit-scrollbar {
                    display: none;
                }
                .tabs-list {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                `}</style>
                {tabs.map((tab, index) => (
                    <div
                        key={index}
                        className="relative flex flex-col items-center p-1 rounded bg-none group flex-shrink-0"
                        style={{ minWidth: 32 }}
                    >
                        <img
                            src={faviconURL(tab.url)}
                            alt="Tab Icon"
                            className="h-[24px] w-[24px] rounded"
                            style={{ minWidth: 24, minHeight: 24 }}
                        />
                        <div
                            className="absolute top-0 right-0 w-[10px] h-[10px] bg-red-500 text-white flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100"
                            onClick={() => removeTab(index)}
                        >
                            <FaTimes size={8} />
                        </div>
                    </div>
                ))}
            </div>
            {/* <div className="flex space-x-2 mt-4">
                <button
                    className="bg-green-500 text-white px-4 py-2 text-sm rounded hover:bg-green-600 dark:hover:bg-green-700"
                    onClick={addTab}
                >
                    + Add Tab
                </button>
                <button
                    className="bg-blue-500 text-white px-4 py-2 text-sm rounded hover:bg-blue-600 dark:hover:bg-blue-700"
                    onClick={saveTabs}
                >
                    Save Changes
                </button>
            </div> */}
        </div>
    );
}
