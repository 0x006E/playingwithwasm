#define WASM_EXPORT __attribute__((visibility("default")))

#include "printf.h"

extern unsigned char __heap_base;
extern unsigned char __data_end;
unsigned int heap_pointer = &__heap_base;
unsigned int stack_pointer = &__data_end;

WASM_EXPORT
void *malloc(unsigned long n)
{
  unsigned int r = heap_pointer;
  unsigned int s = stack_pointer;
  heap_pointer += n;
  stack_pointer -= sizeof(heap_pointer);
  s = (void *)r;
  return (void *)s;
}

WASM_EXPORT
int *init(int width, int height)
{
  int *screen = (int *)malloc(width * height * sizeof(int));
  int length = width * height;
  for (int i = 0; i < length; i++)
  {
    screen[i] = 0xff880088;
  }
  printf("\n %d", sizeof(screen));
  return screen;
}

int i = 0;
WASM_EXPORT
void loop(int *screen, int length)
{
  for (; i < length; i++)
  {
    screen[i] = 0xff88ba88;
  }
}

WASM_EXPORT
void drawcircle(int x, int y, int r)
{
  //static const double PI = 3.1415926535;
  //double i, angle, x1, y1;

  //for (i = 0; i < 360; i += 0.1)
  //{
  //angle = i;
  //x1 = r * cos(angle * PI / 180);
  //y1 = r * sin(angle * PI / 180);
  //draw(x + x1, y + y1, 0xff, 0xff, 0xff);
  //}
  //draw(x, y, 0xfff, 0xfff, 0xfff);
}

WASM_EXPORT
int main()
{
  char *str = "Hello World\n";
  printf(str);
  printf("Hello Not World");
  return 0;
}
