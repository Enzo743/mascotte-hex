"use client";

import React, {useEffect, useMemo, useRef} from "react";

export type LogLevel = "ok" | "erreur"; // Interface pour les types de logs possibles
export type LogMessage = {
    id: string;
    text: string;
    level?: LogLevel;
}; // Interface pour les messages de logs

type Props = {
    messages: LogMessage[];
    maxVisible?: number;
    rows?: number;
};

export default function LogTextarea({
                                        messages,
                                        maxVisible = 5,
                                        rows = 8,
                                    }: Props) {
    // Permet de récupérer la référence du composant
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Permet de gérer la visibilté des messages, par exemple, juste les 5 premiers
    const visible = useMemo(
        () => messages.slice(-maxVisible),
        [messages, maxVisible]
    );

    // Permet de mettre les contours d'une certaine couleur en fonction du type de log
    const ariaInvalid = useMemo(() => {
        if (visible.length === 0) return "false";

        const last = visible[visible.length - 1];
        return last.level === "erreur" ? "true" : "false";
    }, [visible]);

    // Permet de mettre le message en forme
    const value = useMemo(() => {
        return visible
            .map((m) => {
                const prefix =
                    m.level === "erreur" ? "[ERREUR] " : "";
                return `${prefix}${m.text}`;
            })
            .join("\n");
    }, [visible]);

    // Permet de gérer l'auto-scroll
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight; // auto-scroll en bas
    }, [value]);

    return (
        <div>
            <label>
                <textarea
                    ref={textareaRef}
                    value={value}
                    readOnly
                    rows={rows}
                    aria-invalid={ariaInvalid}
                    aria-live="polite"
                    style={{resize: "none"}}
                />
            </label>
        </div>
    );
}