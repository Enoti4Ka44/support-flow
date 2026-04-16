import { CreateTicketForm } from '../components/CreateTicketForm';

export function CreateTicketPage() {
  return (
    <div className="max-w-xl w-full mx-auto animate-fade-in">
      <h1 className="text-xl font-semibold mb-6">Создать заявку</h1>
      <div className="bg-bg-card rounded-xl border border-border-dark p-6">
        <CreateTicketForm />
      </div>
    </div>
  );
}
