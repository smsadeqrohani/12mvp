import { Button } from "../ui/Button";

interface WaitingScreenProps {
  onCancel: () => void;
}

export function WaitingScreen({ onCancel }: WaitingScreenProps) {
  return (
    <div className="w-full max-w-none px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-4">
            منتظر حریف...
          </h2>
          <p className="text-gray-300 mb-6">
            منتظر بمانید تا حریف دیگری به مسابقه بپیوندد
          </p>
          <p className="text-gray-400 mb-6 text-sm">
            وقتی حریف پیدا شد، مسابقه به طور خودکار شروع می‌شود
          </p>
          <Button
            onClick={onCancel}
            variant="danger"
          >
            لغو مسابقه
          </Button>
        </div>
      </div>
    </div>
  );
}

