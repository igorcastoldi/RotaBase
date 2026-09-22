# RotaBase
 
**RotaBase** é uma plataforma (marketplace) de turismo de aventura que conecta viajantes a agências parceiras especializadas em passeios off-road, ecoturismo e experiências em dunas, trilhas e destinos naturais.

Além do marketplace central, a plataforma oferece a cada agência parceira um **modo isolado** (página própria em `/agencia/[slug]`), permitindo que operem com identidade visual e fluxo de reservas dedicados.

## Principais recursos

* **Marketplace + Modo Isolado**: navegação central de agências e páginas dedicadas por agência (ex.: a agência de exemplo "Além das Dunas").

* **Reservas com gestão de frota**: assistente de reserva (`BookingWizard`) com cálculo automático de disponibilidade de veículos.

* **Termo de responsabilidade digital**: `WaiverForm` com assinatura via canvas.

* **Painel do guia (offline-first)**: `GuideDashboard` com suporte PWA/IndexedDB.

* **Mapas**: integração via Leaflet (sem necessidade de API Key).

* **Pagamentos nacionais**: estrutura preparada para PIX e Cartão (Mercado Pago / Asaas).

* **WhatsApp**: integração configurável via Evolution API ou Z-API.

* **Backend Supabase**: schema SQL com RLS (RBAC por papel), enums, triggers e campos `jsonb` para configurações flexíveis.

* **Frontend Next.js (App Router)**: separação entre rotas do marketplace e do modo isolado, com middleware de detecção de contexto.

## Documentação de arquitetura

O documento principal com toda a arquitetura, schema do Supabase e código de referência é:

➡️ **`[rotabase-arquitetura.md](./rotabase-arquitetura.md)`**

Também disponível nos formatos:

* `[rotabase-arquitetura.pdf](./rotabase-arquitetura.pdf)`

* `[rotabase-arquitetura.docx](./rotabase-arquitetura.docx)`

## Como usar este repositório

1. Leia o documento de arquitetura (`rotabase-arquitetura.md`) para entender a estrutura completa do sistema.

2. Utilize o schema SQL do Supabase e os componentes Next.js descritos como base para a implementação.

3. Configure as variáveis de ambiente para provedores de pagamento (Mercado Pago / Asaas) e WhatsApp (Evolution API / Z-API).
