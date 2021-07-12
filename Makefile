LLVM_VERSION ?= 12

DEPS = 
OBJ = out/play.o
OUTPUT = out/play.wasm
INCLUDES_OBJ = $(wildcard include/*.o) $(wildcard include/*.a)

COMPILE_FLAGS = -Wall \
		--target=wasm32 \
		-Os \
		-flto \
		-nostdlib \
		-fvisibility=hidden \
		-std=c99 \
		-ffunction-sections \
		-fdata-sections \
		-DPRINTF_DISABLE_SUPPORT_FLOAT=1 \
		-DPRINTF_DISABLE_SUPPORT_LONG_LONG=1 \
		-DPRINTF_DISABLE_SUPPORT_PTRDIFF_T=1 \
		-I ./include \

$(OUTPUT): $(OBJ) Makefile
	wasm-ld-$(LLVM_VERSION) \
		-o $(OUTPUT) \
		--no-entry \
		--strip-all \
		--export-dynamic \
		--allow-undefined \
		--import-memory \
		-error-limit=0 \
		--lto-O3 \
		-O3 \
		--gc-sections \
		$(OBJ) \
		$(INCLUDES_OBJ) \

%.o: %.c $(DEPS) $(wildcard includes/*.h)  Makefile 
	clang-$(LLVM_VERSION) \
		-c \
		$(COMPILE_FLAGS) \
		-o out/$@ \
		$<

play.wat: $(OUTPUT) Makefile
	~/build/wabt/wasm2wat -o play.wat $(OUTPUT)

wat: play.wat

clean:
	rm -f $(OBJ) $(INCLUDES_OBJ) $(OUTPUT) play.wat