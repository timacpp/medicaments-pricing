import pandas as pd

FILE = 'obwieszczenie-1-lipca-2018'

if __name__ == '__main__':
    # Create dictionary like {1: {'gtin': 5909990244713}, ...}
    data = pd.read_excel(
        f'data/xlsx/{FILE}.xlsx',
        index_col=0,            # Use first column as indices
        header=1,               # Ignore first row
        usecols='A,E',          # Select LP and GTIN
        names=['idx', 'gtin']   # Rename columns
    ).to_dict('index')

    # Reverse the mapping to gtin -> list of id's
    mapping = dict()
    for idx, columns in data.items():
        mapping.setdefault(columns['gtin'], []).append(idx)

    # Print entries with non-unique gtin
    for gtin, ids in mapping.items():
        if len(ids) > 1:
            print(f'GTIN {gtin} corresponds to: {ids}')