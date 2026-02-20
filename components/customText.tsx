import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

export default function CustomText(props: TextProps) {
    const { style, ...rest } = props;
    const flatStyle = StyleSheet.flatten(style) || {};
    
    // Deteksi ketebalan font (fontWeight) dari style bawaanmu
    let fontFamily = 'Poppins_400Regular';
    
    if (flatStyle.fontWeight === 'bold' || flatStyle.fontWeight === '700' || flatStyle.fontWeight === '800') {
        fontFamily = 'Poppins_700Bold';
    } else if (flatStyle.fontWeight === '500' || flatStyle.fontWeight === '600') {
        fontFamily = 'Poppins_500Medium';
    }

    // Delete fontWeight dari style akhir agar tidak bentrok
    const { fontWeight, ...cleanStyle } = flatStyle;

    return (
        <RNText 
            style={[{ fontFamily }, cleanStyle]} 
            {...rest} 
        />
    );
}