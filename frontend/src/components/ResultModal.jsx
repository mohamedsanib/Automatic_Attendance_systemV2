import React from "react";


export default function ResultModal({ content, onClose }) {
return (
<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
<div className="bg-white p-6 rounded-lg w-full max-w-sm">
<h3 className="font-bold text-lg">{content.title}</h3>
<p className="text-slate-600 my-3">{content.message}</p>
<button onClick={onClose} className="bg-blue-500 text-white w-full p-2 rounded-md">
Close
</button>
</div>
</div>
);
}