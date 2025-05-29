from PIL import Image, ImageOps

def convert_to_icon_style(input_path, output_path, threshold=200):
    # Load image and convert to grayscale
    image = Image.open(input_path).convert("L")

    # Apply threshold to make it more icon-like (black & white)
    image = image.point(lambda x: 255 if x > threshold else 0)

    # Convert to RGBA and make white background transparent
    image = image.convert("RGBA")
    data = image.getdata()

    new_data = []
    for item in data:
        if item[0] == 255:  # white
            new_data.append((255, 255, 255, 0))  # transparent
        else:
            new_data.append((0, 0, 0, 255))  # black

    image.putdata(new_data)
    image.save(output_path, "PNG")
    print(f"✅ Saved icon-style image to: {output_path}")

# Example usage
convert_to_icon_style("C:\\Users\\jihad\\Desktop\\my-project\\public\\11.png", "output_icon.png")
