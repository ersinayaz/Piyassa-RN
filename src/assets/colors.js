import { Appearance } from 'react-native';

const Colors = {
    light: {
        color1: '#1A42E0',
        color2: '#2753F4',
        color3: '#4397F7',
        color4: '#C5CACE',
        color5: '#EFF2F5',
        color6: '#FFFFFF',
        color7: '#9B9B9B',
        color8: '#4A4A4A',
        buttonText: "#FFFFFF",
        keyboardArea: "#d1d3d9",
    },
    dark: {
        color1: '#252525',
        color2: '#000000',
        color3: '#4397F7',
        color4: '#9b9b9b',
        color5: '#383938',
        color6: '#2F2F2F',
        color7: '#9B9B9B',
        color8: '#C5CACE',
        buttonText: "#FFFFFF",
        keyboardArea: "#373737",
    }
};

var colorScheme = Appearance.getColorScheme();

Appearance.addChangeListener(({ colorScheme }) => {
    colorScheme = colorScheme;
});

function color(name) {
    return Colors[Appearance.getColorScheme()][name];
}

export { Colors, color };