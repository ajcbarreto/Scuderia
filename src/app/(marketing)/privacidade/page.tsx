import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade — Scuderia itTech",
  description:
    "Como a Scuderia itTech recolhe, utiliza e protege os dados pessoais dos clientes e visitantes.",
};

// NOTA INTERNA (não visível ao utilizador): este é um modelo funcional adaptado
// à aplicação. Antes de publicar, preenche os campos entre [parênteses retos] e
// valida o conteúdo com aconselhamento jurídico.

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 space-y-3">
      <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.35em] text-primary">
        Scuderia itTech
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Política de Privacidade
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última atualização: 17 de junho de 2026
      </p>

      <Section title="1. Responsável pelo tratamento">
        <p>
          A <strong>Scuderia itTech</strong> (nome fiscal: scuderiaittech, NIF
          519202643, com sede na Praceta Gomes Eanes de Zurara, n.º 103, 1.º A,
          4810-482 Guimarães) é responsável pelo tratamento dos dados pessoais
          descritos nesta política. Para qualquer questão sobre privacidade,
          contacta-nos através de{" "}
          <strong>gerencia@scuderiaittech.pt</strong>.
        </p>
      </Section>

      <Section title="2. Que dados recolhemos">
        <p>Conforme a tua relação connosco, podemos tratar:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Dados de conta de cliente:</strong> nome, email e telefone,
            criados quando a oficina te envia um convite de acesso.
          </li>
          <li>
            <strong>Dados das motas:</strong> marca, modelo, ano, matrícula,
            número de chassi (VIN) e notas associadas.
          </li>
          <li>
            <strong>Histórico de serviço:</strong> boletins de manutenção,
            tarefas realizadas, faturas e outros documentos anexados.
          </li>
          <li>
            <strong>Agendamentos:</strong> datas preferidas e mensagens que nos
            envias para marcação de serviço.
          </li>
          <li>
            <strong>Dados de utilização do site e da plataforma</strong>{" "}
            (ver secção 4).
          </li>
        </ul>
      </Section>

      <Section title="3. Para que usamos os dados e com que fundamento">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Prestar o serviço de oficina e dar-te acesso ao histórico da tua
            mota — <em>execução do contrato</em>.
          </li>
          <li>
            Gerir agendamentos e comunicar contigo —{" "}
            <em>execução do contrato e interesse legítimo</em>.
          </li>
          <li>
            Cumprir obrigações legais, nomeadamente de faturação —{" "}
            <em>obrigação legal</em>.
          </li>
          <li>
            Compreender a utilização e melhorar a plataforma —{" "}
            <em>interesse legítimo</em>.
          </li>
        </ul>
      </Section>

      <Section title="4. Dados de utilização e analítica">
        <p>
          Para perceber se o site e a plataforma são úteis e como os melhorar,
          registamos dados de utilização de forma proporcionada:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Visitantes do site (sem conta):</strong> registamos visitas
            de forma agregada — página consultada, data/hora e a origem do
            tráfego ao nível do domínio. Para distinguir sessões usamos um
            identificador temporário guardado no teu navegador
            (<em>sessionStorage</em>), que <strong>não é um cookie
            persistente</strong>, desaparece ao fechar o separador e não te
            identifica. <strong>Não recolhemos o teu endereço IP</strong> nem
            construímos perfis individuais.
          </li>
          <li>
            <strong>Clientes com conta:</strong> registamos ações na conta
            (início de sessão, consulta de boletins, descarga de PDF, pedidos de
            agendamento e alterações de perfil), associadas à tua conta, para
            medir a adoção e melhorar o serviço.
          </li>
          <li>
            <strong>Formulário de contacto:</strong> registamos que um contacto
            foi enviado, sem guardar o conteúdo da mensagem nesse registo de
            utilização.
          </li>
        </ul>
        <p>
          Não utilizamos cookies de publicidade nem partilhamos estes dados com
          redes de rastreio de terceiros.
        </p>
      </Section>

      <Section title="5. Com quem partilhamos os dados">
        <p>
          Não vendemos os teus dados. Recorremos a prestadores de serviço
          (subcontratantes) que os tratam por nossa conta e instruções:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Supabase</strong> — base de dados, autenticação e
            armazenamento dos documentos.
          </li>
          <li>
            <strong>Vercel</strong> — alojamento e funcionamento da aplicação.
          </li>
          <li>
            <strong>Resend</strong> — envio dos emails gerados pelo formulário
            de contacto.
          </li>
        </ul>
      </Section>

      <Section title="6. Durante quanto tempo conservamos os dados">
        <p>
          Conservamos os dados enquanto durar a relação de cliente e pelos
          prazos exigidos por lei (por exemplo, documentos de faturação). Os
          dados de utilização são conservados de forma agregada para análise de
          tendências. [Indica aqui os prazos concretos de conservação.]
        </p>
      </Section>

      <Section title="7. Os teus direitos">
        <p>
          Podes solicitar o acesso, retificação, apagamento, limitação ou
          portabilidade dos teus dados, bem como opor-te a determinados
          tratamentos. Para exercer estes direitos, contacta-nos através de{" "}
          <strong>gerencia@scuderiaittech.pt</strong>. Tens ainda o
          direito de apresentar reclamação à autoridade de controlo, a Comissão
          Nacional de Proteção de Dados (CNPD).
        </p>
      </Section>

      <Section title="8. Alterações a esta política">
        <p>
          Poderemos atualizar esta política sempre que necessário. A data da
          última atualização indicada no topo reflete a versão em vigor.
        </p>
      </Section>
    </div>
  );
}
