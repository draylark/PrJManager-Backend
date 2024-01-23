import { useEffect, useState, SyntheticEvent } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useFormikContext } from 'formik';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { FriendType } from '../../../../store/types/stateTypes';


// ... Tu código anterior

interface OptionType {
  value: string;
  label: string;
}

export const ParticipantsField = () => {

  const { setFieldValue } = useFormikContext();

  const { friends } = useSelector((state: RootState) => state.friends);
  const [options, setOptions] = useState<OptionType[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<readonly OptionType[]>([]);

  useEffect(() => {
    const options = friends.map((friend: FriendType) => {
      return { value: friend.fid, label: `${friend.firstName} ${friend.lastName}` };
    });
    setOptions(options);
  }, [friends]);


  const handleClientSelect = ( _: SyntheticEvent<Element, Event>,  newValues: readonly OptionType[] ) => {
    setSelectedOptions(newValues);  // Actualizar el estado local para las etiquetas
    const newClientValues = newValues.map((client) => client.value);
    setFieldValue('participants', newClientValues);
  };

  return (
    <>
      <Autocomplete
        className='mt-7'
        multiple
        id="tags-filled"
        options={options}
        value={selectedOptions}  // Utilizar el estado local para el valor
        onChange={handleClientSelect}
        renderInput={(params) => (
          <TextField {...params} variant="filled" label="Participants" />
        )}
      />
    </>
  );
};