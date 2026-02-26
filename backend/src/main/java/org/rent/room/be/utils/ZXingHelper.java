package org.rent.room.be.utils;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import java.io.ByteArrayOutputStream;

public class ZXingHelper {


    public static byte[] getQRCodeImage(String text,int width,int height){
        try{
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE,width,height);
            ByteArrayOutputStream byteArrayOutputStram = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "png", byteArrayOutputStram);
            return byteArrayOutputStram.toByteArray();
        }catch (Exception e){
            return  null;
        }
    }
}
