#define WASM_EXPORT __attribute__((visibility("default")))
#define LINE_HEIGHT 8

#include <printf.h>
#include <font8x8.h>
#include <openlibm.h>

extern unsigned char __heap_base;
extern unsigned char __data_end;
unsigned int heap_pointer = (int)&__heap_base;
unsigned int stack_pointer = (int)&__data_end;

WASM_EXPORT
void *malloc(unsigned long n)
{
  unsigned int r = heap_pointer;
  unsigned int s = stack_pointer;
  heap_pointer += n;
  stack_pointer -= sizeof(heap_pointer);
  s = (int)(void *)r;
  return (void *)r;
}

void draw(int x, int y, int width, int *screen, int color)
{
  if (x >= 0 && y >= 0)
  {
    int pos = y * width + x;
    screen[pos] = color;
  }
}

WASM_EXPORT
void loop(int xo, int yo, char *bitmap, int *screen, int width)
{
  int x = 0, y = 0;
  int set;
  for (x = 0; x < 8; x++)
  {
    for (y = 0; y < 8; y++)
    {
      set = bitmap[y] & 1 << x;
      //printf("\ncurrX: %d, currY: %d", x, y);
      if (set)
        draw(x + xo, y + yo, width, screen, 0x004AF626);
    }
  }
}

WASM_EXPORT
int *init(int width, int height)
{
  int *screen = (int *)malloc(width * height * sizeof(int));
  int length = width * height;
  for (int i = 0; i < length; i++)
  {
    screen[i] = 0xff000000;
  }
  printf("\n %d", sizeof(screen));
  char *str = "Hello World\nNithin S Varrier";
  int currX = 0, currY = 0;
  for (int i = 0; str[i] != '\0'; ++i)
  {
    if (str[i] != ' ')
      loop(currX, currY, font8x8_basic[(int)str[i]], screen, width);
    if (str[i] == '\n')
    {
      currX = 0;
      currY += LINE_HEIGHT;
      continue;
    }
    currX += 9;
  } //circleBres(20, 20, 50, screen, width);
  return screen;
}

WASM_EXPORT
double sin_test(double rad)
{
  return sin(rad);
}

WASM_EXPORT
int main()
{

  char *str = "Hello World\n";
  printf(str);
  printf("Hello Not World");
  printf("%d", sin(3.14 / 2));
  return 0;
}
