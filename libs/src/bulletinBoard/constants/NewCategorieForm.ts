import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';

interface NewCategorieForm {
  name: string;
  isActive: boolean;
  visibleByUsers: MultipleSelectorOptionSH[];
  visibleByGroups: MultipleSelectorOptionSH[];
  editableByUsers: MultipleSelectorOptionSH[];
  editableByGroups: MultipleSelectorOptionSH[];
}

export default NewCategorieForm;
