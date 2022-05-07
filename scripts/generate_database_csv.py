import os
import csv
import pandas as pd

DATA_FOLDER = os.path.join('..', 'data')
EXCEL_FOLDER = os.path.join('..', 'data', 'xlsx')
POLISH_MONTHS = {
    'stycznia': 1,
    'marca': 3,
    'marzec': 3,  # >:(
    'maja': 5,
    'lipca': 7,
    'wrzesnia': 9,
    'listopada': 11,
}


def full_path(file, type):
    extension = '' if file.endswith(f'.{type}') else f'.{type}'
    return os.path.join(DATA_FOLDER, type, f'{file}{extension}')


def full_excel_path(file):
    return full_path(file, 'xlsx')


def full_csv_path(file):
    return full_path(file, 'csv')


def open_csv(file):
    return open(full_csv_path(file), 'w', encoding='UTF8')


def get_dataframe(file):
    return pd.read_excel(
        full_excel_path(file),
        header=None,  # Do not use column names
        index_col=0,
        usecols='B,C,D,J',
        skiprows=[0, 1, 2],
        names=['substancja', 'nazwa', 'zawartosc', 'cena'],
        sheet_name=[0, 3, 4]  # Consider A1, B, C worksheets
    )


def date_of_validity(excel_file):
    day, month, year = excel_file.split('-')[1:]
    year = year.partition('.')[0]

    month_numeric = POLISH_MONTHS.get(month)
    assert month_numeric is not None

    return f'{day}-{month_numeric}-{year}'


def flat_enumerate(container):
    if not container:
        return []
    if type(container[0]) != tuple:
        return enumerate(container)
    return [(idx, *data) for idx, data in enumerate(container)]


def to_cents(price):
    return int(price.replace(',', ''))


def extract_data(excel_file):
    frame = get_dataframe(excel_file)
    date = date_of_validity(excel_file)

    substances, prices, medicine = [], [], []
    unique_substances, unique_prices, unique_medicine = set(), set(), set()

    for _, dataset in frame.items():
        for substance, name, content, price in dataset.to_records():
            a.add(substance)

            if substance not in unique_substances:
                substances.append(substance)
                unique_substances.add(substance)

            substance_id = substances.index(substance)
            medicine_record = (substance_id, name, content)
            if medicine_record not in unique_medicine:
                medicine.append(medicine_record)
                unique_medicine.add(medicine_record)

            medicine_id = medicine.index((substance_id, name, content))
            price_record = (medicine_id, to_cents(price), date)
            if price_record not in unique_prices:
                prices.append(price_record)
                unique_prices.add(price_record)
    
    return flat_enumerate(medicine), prices, flat_enumerate(substances)


def csv_writer(file, header):
    new_writer = csv.writer(file)
    new_writer.writerow(header)
    return new_writer


if __name__ == '__main__':
    with open_csv('lek') as med_file:
        with open_csv('cena') as price_file:
            with open_csv('substancja') as substance_file:
                medicine = csv_writer(med_file, ['id, substancja', 'nazwa', 'zawartosc'])
                prices = csv_writer(price_file, ['lek', 'wartosc', 'dzien'])
                substances = csv_writer(substance_file, ['id, nazwa'])

                writers = [medicine, prices, substances]

                for filename in os.listdir(EXCEL_FOLDER):
                    data = extract_data(filename)
                    for writer, records in zip(writers, data):
                        writer.writerows(records)
