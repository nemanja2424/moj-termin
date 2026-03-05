'use client';

import { useRef, useState, useEffect } from 'react';
import styles from './MarkdownEditor.module.css';

export default function MarkdownEditor({ value, onChange, placeholder = 'Unesite tekst...' }) {
    const editorRef = useRef(null);
    const [isComposing, setIsComposing] = useState(false);
    const [activeCommands, setActiveCommands] = useState({});

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, []);

    const updateValue = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            onChange({ target: { value: html } });
        }
        updateActiveState();
    };

    const updateActiveState = () => {
        setActiveCommands({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            formatBlockH1: document.queryCommandValue('formatBlock') === 'h1',
            formatBlockH2: document.queryCommandValue('formatBlock') === 'h2',
        });
    };

    const handleMouseUp = () => {
        setTimeout(updateActiveState, 0);
    };

    const applyFormatting = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        updateValue();
    };

    const toolbarButtons = [
        { label: 'B', title: 'Boldirano', command: 'bold', stateKey: 'bold' },
        { label: 'I', title: 'Kurziv', command: 'italic', stateKey: 'italic' },
        { label: 'U', title: 'Podvučeno', command: 'underline', stateKey: 'underline' },
        { label: 'H1', title: 'Naslov 1', command: 'formatBlock', value: '<h1>', stateKey: 'formatBlockH1' },
        { label: 'H2', title: 'Naslov 2', command: 'formatBlock', value: '<h2>', stateKey: 'formatBlockH2' },
    ];

    return (
        <div className={styles.editorContainer}>
            <div className={styles.toolbar}>
                {toolbarButtons.map((btn, idx) => (
                    <button
                        key={idx}
                        type="button"
                        className={`${styles.toolbarBtn} ${activeCommands[btn.stateKey] ? styles.active : ''}`}
                        title={btn.title}
                        onClick={() => applyFormatting(btn.command, btn.value)}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>

            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className={styles.editor}
                onInput={updateValue}
                onMouseUp={handleMouseUp}
                onKeyUp={handleMouseUp}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => {
                    setIsComposing(false);
                    updateValue();
                }}
                data-placeholder={placeholder}
            />
        </div>
    );
}
