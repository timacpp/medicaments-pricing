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

    month_numeric = str(POLISH_MONTHS.get(month)).rjust(2, '0')
    assert month_numeric is not None

    return f'{year}-{month_numeric}-0{day}'


def flat_enumerate(container, start):
    if not container:
        return []

    enumerated = enumerate(container, start=start)

    if type(container[0]) != tuple:
        return enumerated
    return [(idx, *data) for idx, data in enumerated]


def to_cents(price):
    return int(price.replace(',', ''))


def extract_data(excel_file, sub_ids, med_ids, price_set):
    frame = get_dataframe(excel_file)
    date = date_of_validity(excel_file)

    min_med_id, min_sub_id = len(med_ids), len(sub_ids)

    substances, medicine, prices = [], [], []

    for _, dataset in frame.items():
        for substance, name, content, price in dataset.to_records():
            if substance not in sub_ids:
                substances.append(substance)
                sub_ids[substance] = len(sub_ids)

            substance_id = sub_ids[substance]
            medicine_record = (substance_id, name, content)
            if medicine_record not in med_ids:
                medicine.append(medicine_record)
                med_ids[medicine_record] = len(med_ids)

            medicine_id = med_ids[(substance_id, name, content)]
            price_record = (medicine_id, to_cents(price), date)
            if price_record not in price_set:
                prices.append(price_record)
                price_set.add(price_record)

    return flat_enumerate(medicine, min_med_id), prices, flat_enumerate(substances, min_sub_id)


def csv_writer(file, header):
    new_writer = csv.writer(file)
    new_writer.writerow(header)
    return new_writer


if __name__ == '__main__':
    with open_csv('lek') as med_file:
        with open_csv('cena') as price_file:
            with open_csv('substancja') as substance_file:
                medicine_writer = csv_writer(med_file, ['id', 'substancja', 'nazwa', 'zawartosc'])
                prices_writer = csv_writer(price_file, ['lek', 'wartosc', 'dzien'])
                substances_writer = csv_writer(substance_file, ['id', 'nazwa'])
                writers = [medicine_writer, prices_writer, substances_writer]

                substance_ids, medicine_ids, unique_prices = {}, {}, set()

                for filename in os.listdir(EXCEL_FOLDER):
                    data = extract_data(filename, substance_ids, medicine_ids, unique_prices)
                    for writer, records in zip(writers, data):
                        writer.writerows(records)
