import type { Medicine } from '@/lib';
import type { AddMedicineForm } from '../types';

export interface AddMedicineFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (form: AddMedicineForm) => Promise<void>;
  availableMedicines: Medicine[];
  editData?: AddMedicineForm | null;
}

