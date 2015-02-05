import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.List;
import java.io.File;
import java.io.IOException;

public class Binarization {
  public BufferedImage Process(BufferedImage src, BufferedImage dest) {
    int width = src.getWidth();
    int height = src.getHeight();

    int[] inPixels = new int[width*height];
    int[] outPixels = new int[width*height];
    getRGB(src, inPixels);
    int index = 0;
    int means = getThreshold(inPixels, height, width);
    for(int row=0; row<height; row++) {
      int tr = 0, tg = 0, tb = 0;
      for(int col=0; col<width; col++) {
        index = row * width + col;
        tr = (inPixels[index] >> 16) & 0xff;
        tg = (inPixels[index] >> 8) & 0xff;
        tb = inPixels[index] & 0xff;
        if(tr > means) {
          tr = tg = tb = 255; //white
        } else {
          tr = tg = tb = 0; // black
        }
        outPixels[index] = (tr << 16) | (tg << 8) | tb;
      }
    }
    setRGB(outPixels, dest);
    return dest;
  }

  void getRGB(BufferedImage image, int[] pixels) {
    int width = image.getWidth();
    int height = image.getHeight();
    for (int row = 0; row < height; row++) {
      for (int col = 0; col < width; col++) {
        pixels[row*width+col] = image.getRGB(col, row);
      }
    }
  }

  void setRGB(int[] pixels, BufferedImage image) {
    int width = image.getWidth();
    int height = image.getHeight();
    for (int row = 0; row < height; row++) {
      for (int col = 0; col < width; col++) {
        image.setRGB(col, row, pixels[row*width+col]);
      }
    }
  }

  private int getThreshold(int[] inPixels, int height, int width) {
    // maybe this value can reduce the calculation consume;   
    int inithreshold = 127;  
    int finalthreshold = 0;  
    int temp[] = new int[inPixels.length];  
    for(int index=0; index<inPixels.length; index++) {  
      temp[index] = (inPixels[index] >> 16) & 0xff;  
    }  
    List<Integer> sub1 = new ArrayList<Integer>();  
    List<Integer> sub2 = new ArrayList<Integer>();  
    int means1 = 0, means2 = 0;  
    while(finalthreshold != inithreshold) {  
      finalthreshold = inithreshold;  
      for(int i=0; i<temp.length; i++) {  
        if(temp[i] <= inithreshold) {  
          sub1.add(temp[i]);  
        } else {  
          sub2.add(temp[i]);  
        }  
      }  
      means1 = getMeans(sub1);  
      means2 = getMeans(sub2);  
      sub1.clear();  
      sub2.clear();  
      inithreshold = (means1 + means2) / 2;  
    }  
    long start = System.currentTimeMillis();  
    System.out.println("Final threshold  = " + finalthreshold);  
    long endTime = System.currentTimeMillis() - start;  
    System.out.println("Time consumes : " + endTime);  
    return finalthreshold;  
  }

  private static int getMeans(List<Integer> data) {
    int result = 0;  
    int size = data.size();  
    for(Integer i : data) {
      result += i;  
    }
    return (result/size);  
  }

  public static void main(String[] args) {
    try {
      BufferedImage inputImage = ImageIO.read(new File(args[0]));
      BufferedImage outputImage = new BufferedImage(inputImage.getWidth(),
                                                    inputImage.getHeight(),
                                                    BufferedImage.TYPE_INT_RGB);
      Binarization algo = new Binarization();
      algo.Process(inputImage, outputImage);
      ImageIO.write(outputImage, "jpg", new File(args[1]));
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
