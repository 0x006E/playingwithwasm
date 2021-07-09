LLVM_VERSION ?= 12

DEPS = 
OBJ = out/play.o
OUTPUT = out/play.wasm

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
		-DPRINTF_DISABLE_SUPPORT_PTRDIFF_T=1

$(OUTPUT): $(OBJ) Makefile
	wasm-ld-$(LLVM_VERSION) \
		-o $(OUTPUT) \
		--no-entry \
		--strip-all \
		--export-dynamic \
		--allow-undefined \
		--initial-memory=131072 \
		-error-limit=0 \
		--lto-O3 \
		-O3 \
		--gc-sections \
		$(OBJ) \

%.o: src/%.c $(DEPS) Makefile
	clang-$(LLVM_VERSION) \
		-c \
		$(COMPILE_FLAGS) \
		-o out/$@ \
		$<

play.wat: $(OUTPUT) Makefile
	~/build/wabt/wasm2wat -o play.wat $(OUTPUT)

wat: play.wat

clean:
	rm -f $(OBJ) $(OUTPUT) play.wat