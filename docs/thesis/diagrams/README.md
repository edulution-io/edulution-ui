# Thesis Diagrams

**Thesis:** "Cross-App-Intelligenz in Echtzeit: Systementwurf und empirische Evidenz für agentische Personalisierung"

## Directory Structure

```
diagrams/
├── architecture/          # System architecture diagrams
├── examples/              # Concrete usage examples
├── timelines/             # DEV vs PROD timing diagrams
├── analysis/              # Evaluation and analysis diagrams
└── THESIS_DIAGRAMS.md     # All diagrams combined
```

## Diagram Index

| # | File | Description | Chapter |
|---|------|-------------|---------|
| 01 | `architecture/01-system-overview.mermaid` | Overall system components | 3. Systemarchitektur |
| 02 | `architecture/02-event-to-recommendation.mermaid` | Event transformation flow | 4. Implementierung |
| 03 | `examples/03-mail-attachments.mermaid` | Mail attachment scenario | 5. Anwendungsbeispiele |
| 04 | `examples/04-conference-workspace.mermaid` | Conference setup scenario | 5. Anwendungsbeispiele |
| 05 | `examples/05-multi-source-aggregation.mermaid` | Cross-app aggregation | 4.3 Cross-App Aggregation |
| 06 | `timelines/06-dev-mode-timeline.mermaid` | DEV mode processing | 4.4 Betriebsmodi |
| 07 | `timelines/07-prod-mode-timeline.mermaid` | PROD mode processing | 4.4 Betriebsmodi |
| 08 | `timelines/08-dev-vs-prod-comparison.mermaid` | Side-by-side comparison | 4.4 Betriebsmodi |
| 09 | `analysis/09-class-priority-ablation.mermaid` | Ablation study finding | 6. Evaluation |
| 10 | `analysis/10-action-execution-flow.mermaid` | Action state machine | 4.5 Agentische Aktionen |
| 11 | `analysis/11-cache-strategy.mermaid` | Multi-layer caching | 4.6 Performance |

## Rendering

### Preview in VS Code
Install "Mermaid Preview" extension and open any `.mermaid` file.

### Export to PNG/PDF
```bash
npm install -g @mermaid-js/mermaid-cli

# Export single diagram
mmdc -i diagrams/architecture/01-system-overview.mermaid -o output.png -t neutral

# Export all diagrams
find diagrams -name "*.mermaid" -exec sh -c 'mmdc -i "$1" -o "${1%.mermaid}.png" -t neutral' _ {} \;
```

### Include in LaTeX
```latex
\begin{figure}[h]
  \centering
  \includegraphics[width=\textwidth]{diagrams/architecture/01-system-overview.png}
  \caption{Systemarchitektur der Cross-App Intelligence}
  \label{fig:system-overview}
\end{figure}
```
