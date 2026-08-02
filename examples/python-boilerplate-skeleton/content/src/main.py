from dotenv import load_dotenv

load_dotenv()


def main() -> None:
    print("Hello from ${{ values.name }}!")


if __name__ == "__main__":
    main()
