import EStyleSheet from 'react-native-extended-stylesheet';
import Color from 'color';


const styles = EStyleSheet.create({
  $inputBackground: () => Color(EStyleSheet.value('$colors.max')).alpha(0.03),
  row: {
    marginVertical: 12,
  },
  label: {
    marginBottom: 8,
  },
  labelText: {
    fontSize: 20,
    color: '$colors.max'
  },
  input: {
    paddingHorizontal: 16,
    backgroundColor: '$inputBackground',
    paddingTop: 8,
    paddingBottom: 8,
    textAlignVertical: 'top',
    fontSize: 18,
  },
  picker: {
    paddingHorizontal: 16,
    borderWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    textAlignVertical: 'top',
    flexDirection: 'row',

  },
  inputContainer: {
    marginTop: 8,
  },
  inputIcon: {
    position: 'absolute',
    right: 8,
    height: '100%',
    top: '35%',
  },
  error: {
    color: 'red',
  },
});

export default styles;
