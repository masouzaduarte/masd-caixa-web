# Proposta de cores e layout – MASD Caixa

Tema **moderno e amigável** aplicado ao projeto.

---

## Paleta de cores

| Uso | Cor | Hex | Observação |
|-----|-----|-----|------------|
| **Primary** | Teal | `#0d9488` | Ações principais, links, indicador de item ativo. Transmite confiança e clareza (adequado para app financeiro). |
| **Primary hover** | Teal escuro | `#0f766e` | Estado hover de botões primários. |
| **Sidebar** | Azul escuro suave | `#1e3a5f` | Barra lateral. Profissional e menos “tech”, mais acolhedor. |
| **Sidebar hover** | Azul médio | `#2d4a6f` | Hover nos itens do menu. |
| **Item ativo** | Barra teal + fundo | `#0d9488` + fundo 15% teal | Barra vertical à esquerda + fundo suave. |
| **Background** | Cinza azulado | `#f1f5f9` | Fundo da aplicação. |
| **Surface** | Branco | `#ffffff` | Cards, topbar, inputs. |
| **Texto** | Slate escuro | `#0f172a` | Texto principal. |
| **Texto secundário** | Slate médio | `#64748b` | Legendas, hints. |
| **Bordas** | Cinza claro | `#e2e8f0` | Divisórias e contornos suaves. |
| **Sucesso** | Verde | `#059669` | Saldo positivo, confirmações. |
| **Erro** | Vermelho suave | `#b91c1c` | Mensagens de erro. |

---

## Layout e componentes

- **Border radius:** 12px em cards, 8px em botões e inputs (visual mais “soft”).
- **Sombras:** Leves e em camadas (`0 1px 3px` + `0 4px 12px`) para dar profundidade sem peso.
- **Sidebar (260px):** Item ativo com barra vertical teal à esquerda e fundo levemente teal; hover suave nos itens.
- **Topbar:** Borda inferior sutil, padding maior (1rem vertical, 1.75rem horizontal).
- **Área de conteúdo:** Padding 1.75rem, max-width 1024px, centralizada.
- **Tipografia:** Inter, line-height 1.5; títulos com `letter-spacing: -0.02em`.

---

## Onde está aplicado

- **`src/index.css`** – Variáveis CSS (`:root`) e classes utilitárias (`.card`, `.btn`, `.sidebar-link`, etc.).
- **`src/components/Layout.tsx`** – Sidebar e topbar usando as novas variáveis e classes.
- **`src/components/StatCard.tsx`** e **`src/components/AlertBanner.tsx`** – Ajustes de radius, sombra e cores do tema.

As páginas que já usam as classes (`.card`, `.btn-primary`, `.page-title`, `.error-box`, etc.) passam a herdar o novo visual automaticamente.
