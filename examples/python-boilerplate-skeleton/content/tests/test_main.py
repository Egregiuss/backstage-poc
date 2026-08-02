from src.main import main


def test_main(capsys: object) -> None:
    main()
    captured = capsys.readouterr()  # type: ignore[attr-defined]
    assert "${{ values.name }}" in captured.out
