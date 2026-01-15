import { Delete } from 'lucide-react';


interface KeypadProps {
    onKeyPress: (key: string) => void;
    onDelete: () => void;
    onSubmit: () => void;
}

export function Keypad({ onKeyPress, onDelete, onSubmit }: KeypadProps) {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

    return (
        <div className="grid grid-cols-3 gap-4 pb-6 px-6">
            {keys.map((key) => (
                <button
                    key={key}
                    onClick={() => onKeyPress(key)}
                    className="h-16 text-3xl font-medium text-white rounded-full bg-surface/50 hover:bg-surface active:bg-surface/80 transition-colors flex items-center justify-center"
                >
                    {key}
                </button>
            ))}

            <button
                onClick={onDelete}
                className="h-16 text-white rounded-full bg-surface/50 hover:bg-surface active:bg-surface/80 transition-colors flex items-center justify-center group"
            >
                <Delete className="w-8 h-8 stroke-[1.5] group-active:scale-90 transition-transform" />
            </button>

            <div className="col-span-3 mt-2">
                <button
                    onClick={onSubmit}
                    className="w-full h-16 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white text-xl font-bold rounded-full transition-all shadow-lg shadow-blue-500/25"
                >
                    Done
                </button>
            </div>
        </div>
    );
}
