import i18n from '../i18n/_i18n';
import { color } from '../assets/colors';
import Lottie from 'lottie-react-native';
import useColorScheme from '../assets/useColorScheme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';


const FeedbackModal = ({ modalRef }) => {
    const colorScheme = useColorScheme();
    const styles = StyleSheet.create({
        container: {
            alignItems: "center",
            justifyContent: "center"
        },
        back: {
            top: 0,
            right: 20,
            width: 36,
            zIndex: 2,
            height: 36,
            padding: 5,
            borderRadius: 36,
            alignItems: "center",
            position: "absolute",
            justifyContent: "center",
            backgroundColor: color("color5"),
        },
        modalTitle: {
            fontSize: 16,
            fontWeight: "bold",
            textAlign: "center",
            color: color("color8"),
        },
        modalDescription: {
            fontSize: 14,
            marginTop: 10,
            textAlign: "center",
            color: color("color8"),
        },
        lottie: {
            width: "100%",
            height: 200,
        }
    });
    
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.back} onPress={() => { modalRef.current.close(); }}>
                <Ionicons name="close" size={16} color={color('color9')} />
            </TouchableOpacity>
            <View style={styles.lottie}>
                <Lottie source={require('../assets/animations/QWe38Ocnlm.json')} autoPlay loop />
            </View>
            <View style={{ justifyContent: "center" }}>
                <Text style={styles.modalTitle}>{i18n.t("lbl_ThankYou")}</Text>
                <Text style={styles.modalDescription}>{i18n.t("lbl_FeedbackSuccessText")}</Text>
            </View>
        </View>
    );
};

export default FeedbackModal;
