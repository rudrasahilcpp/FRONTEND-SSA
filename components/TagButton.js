import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable } from 'react-native';

function TagButton(props){
    return(
        <Pressable onPress={props.Function}>
            <View style={styles.Container}>
                <Text style={styles.text}>{props.Text}</Text>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    Container : {
        height : 30,
        width : 100,
        backgroundColor : 'orange',
    },
    text : {
        fontSize : 20,
        textAlign : 'center',
    }
})

export default TagButton;